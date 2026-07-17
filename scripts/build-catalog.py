#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

RESOURCE_ROOTS = [Path("apps"), Path("notebooks")]
MODULE_ROOT = Path("modules")
COURSE_ROOT = Path("courses")


def load_json(path):
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Could not read {path}: {exc}") from exc


def slugify(value):
    value = re.sub(r"[^a-z0-9]+", "-", str(value).lower()).strip("-")
    return value or "untitled"


def is_gpu_item(item):
    if item.get("gpu") is True:
        return True

    fields = [item.get("title", ""), item.get("description", "")]
    tags = item.get("tags", [])
    fields.extend(tags if isinstance(tags, list) else [])
    blob = " ".join(str(field) for field in fields).lower()
    return any(keyword in blob for keyword in ("webgpu", "webgl2", "webgl", "gpu"))


def load_resources(warnings, errors):
    resources = []
    seen_ids = {}

    for root in RESOURCE_ROOTS:
        if not root.exists():
            continue

        for meta_path in sorted(root.rglob("app.json")):
            folder = meta_path.parent
            try:
                item = load_json(meta_path)
            except ValueError as exc:
                errors.append(str(exc))
                continue

            resource_id = item.get("id")
            if not resource_id:
                resource_id = slugify(str(folder).replace("\\", "/"))
                item["id"] = resource_id
                item["legacyGeneratedId"] = True
                warnings.append(
                    f"{meta_path} has no stable id; temporarily generated '{resource_id}'"
                )

            if resource_id in seen_ids:
                errors.append(
                    f"Duplicate resource id '{resource_id}' in {meta_path} and {seen_ids[resource_id]}"
                )
                continue
            seen_ids[resource_id] = meta_path

            entry = item.get("entry", "index.html")
            url = str(folder / entry).replace("\\", "/")
            if entry == "index.html":
                url = str(folder).replace("\\", "/") + "/"

            item["url"] = url
            item["path"] = str(folder).replace("\\", "/")
            item["gpu"] = is_gpu_item(item)
            resources.append(item)

    order = {"comparative": 0, "pilot-wave": 1, "foundations": 2}
    resources.sort(
        key=lambda item: (
            item.get("type", ""),
            order.get(item.get("category", ""), 99),
            item.get("title", ""),
        )
    )
    return resources


def load_modules(errors):
    modules = []
    seen_ids = {}

    if not MODULE_ROOT.exists():
        return modules

    for path in sorted(MODULE_ROOT.glob("*.json")):
        try:
            module = load_json(path)
        except ValueError as exc:
            errors.append(str(exc))
            continue

        module_id = module.get("id")
        if not module_id:
            errors.append(f"{path} is missing required field 'id'")
            continue
        if module_id in seen_ids:
            errors.append(
                f"Duplicate module id '{module_id}' in {path} and {seen_ids[module_id]}"
            )
            continue

        seen_ids[module_id] = path
        modules.append(module)

    modules.sort(key=lambda module: (module.get("order", 999), module.get("title", "")))
    return modules


def load_courses(errors):
    courses = []
    seen_ids = {}

    if not COURSE_ROOT.exists():
        return courses

    for path in sorted(COURSE_ROOT.glob("*.json")):
        if path.name.startswith("_"):
            continue
        try:
            course = load_json(path)
        except ValueError as exc:
            errors.append(str(exc))
            continue

        course_id = course.get("id")
        if not course_id:
            errors.append(f"{path} is missing required field 'id'")
            continue
        if course_id in seen_ids:
            errors.append(
                f"Duplicate course id '{course_id}' in {path} and {seen_ids[course_id]}"
            )
            continue

        seen_ids[course_id] = path
        courses.append(course)

    courses.sort(key=lambda course: course.get("title", ""))
    return courses


def validate_references(resources, modules, courses, errors):
    resource_ids = {item["id"] for item in resources}
    module_ids = {module["id"] for module in modules}

    for item in resources:
        module_id = item.get("module")
        if module_id and module_id not in module_ids:
            errors.append(
                f"Resource '{item['id']}' references unknown module '{module_id}'"
            )

    for module in modules:
        for related_id in module.get("relatedModules", []):
            if related_id not in module_ids:
                errors.append(
                    f"Module '{module['id']}' references unknown related module '{related_id}'"
                )

    for course in courses:
        for section in course.get("sections", []):
            for entry in section.get("items", []):
                entry_type = entry.get("type")
                entry_id = entry.get("id")
                if entry_type == "module" and entry_id not in module_ids:
                    errors.append(
                        f"Course '{course['id']}' references unknown module '{entry_id}'"
                    )
                elif entry_type == "resource" and entry_id not in resource_ids:
                    errors.append(
                        f"Course '{course['id']}' references unknown resource '{entry_id}'"
                    )
                elif entry_type not in {"module", "resource"}:
                    errors.append(
                        f"Course '{course['id']}' has item with invalid type '{entry_type}'"
                    )


def attach_resources_to_modules(resources, modules):
    by_module = {module["id"]: [] for module in modules}
    for resource in resources:
        module_id = resource.get("module")
        if module_id in by_module:
            by_module[module_id].append(resource["id"])

    enriched = []
    for module in modules:
        copy = dict(module)
        copy["resources"] = by_module[module["id"]]
        enriched.append(copy)
    return enriched


def main():
    warnings = []
    errors = []

    resources = load_resources(warnings, errors)
    modules = load_modules(errors)
    courses = load_courses(errors)
    validate_references(resources, modules, courses, errors)

    for warning in warnings:
        print(f"WARNING: {warning}", file=sys.stderr)

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)

    # Preserve the existing homepage input during the transition.
    with open("catalog.json", "w", encoding="utf-8") as handle:
        json.dump(resources, handle, indent=2, ensure_ascii=False)

    site_data = {
        "modules": attach_resources_to_modules(resources, modules),
        "resources": resources,
        "courses": courses,
    }
    with open("site-data.json", "w", encoding="utf-8") as handle:
        json.dump(site_data, handle, indent=2, ensure_ascii=False)

    print(
        f"Wrote catalog.json and site-data.json with "
        f"{len(resources)} resources, {len(modules)} modules, and {len(courses)} courses"
    )


if __name__ == "__main__":
    main()
