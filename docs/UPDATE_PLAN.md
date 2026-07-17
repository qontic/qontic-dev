# Q-Ontic Lab site update plan

## Goal

Reorganize Q-Ontic Lab around physics topics and modules while preserving direct access to simulations, notebooks, videos, and other resources.

The homepage should initially present physics topics. Each module should have a canonical landing page collecting its related resources. Courses and other curated collections should reference modules, individual resources, or both.

## Core content model

### Modules

A module is the principal educational unit and corresponds to a physics topic such as Quantum Tunneling, Double Slit, Stern–Gerlach, or Bell Correlations.

Each module has stable metadata and may contain any number of resources.

### Resources

A resource is an individual simulation, notebook, video, instructor activity, paper, or related item.

Each resource must have a stable unique `id` and normally identifies its parent module through a `module` field. Resources may also carry intrinsic metadata such as physics topics, interpretations, level, and technical requirements.

Courses are deliberately not stored as tags on modules or resources.

### Courses and other collections

A course is an ordered collection that may reference:

- a whole module;
- one individual resource;
- several individual resources from the same module;
- a mixture of modules and resources.

Course-specific instructions, labels, sequencing, and preferred notebook mode belong in the course definition rather than in the referenced resource.

The same reference model may later be used for learning paths, workshops, and other curated collections.

## Notebook modes

Notebooks should support two views of the same source document:

- **Concise:** the central question, simulation, essential instructions, observations, and only the equations needed for the activity.
- **Detailed:** the concise material plus derivations, extended explanations, historical context, technical notes, optional advanced activities, and references.

The two modes should not be maintained as separate notebook files. Detailed-only sections should be marked in the HTML and controlled by shared CSS and JavaScript. Concise should be the default for new visitors, with the selected mode remembered locally.

## Metadata examples

### Module

```json
{
  "id": "quantum-tunneling",
  "title": "Quantum Tunneling",
  "summary": "Explore transmission through classically forbidden regions using several quantum representations.",
  "topics": ["wave-mechanics", "potential-barriers"],
  "interpretations": ["orthodox", "pilot-wave", "many-worlds"],
  "order": 30,
  "relatedModules": ["potential-step", "wave-packets"]
}
```

### Resource

```json
{
  "id": "tunneling-pilot-wave-notebook",
  "title": "Pilot-Wave Tunneling",
  "type": "notebook",
  "module": "quantum-tunneling",
  "topics": ["wave-mechanics", "potential-barriers"],
  "interpretations": ["pilot-wave"],
  "level": "intermediate",
  "description": "Explore tunneling using wave-packet dynamics and Bohmian trajectories.",
  "entry": "index.html",
  "status": "approved"
}
```

### Course

```json
{
  "id": "intro-quantum",
  "title": "Introduction to Quantum Mechanics",
  "sections": [
    {
      "title": "Wave Mechanics",
      "items": [
        { "type": "module", "id": "free-particle" },
        {
          "type": "resource",
          "id": "double-slit-analytical-simulation",
          "label": "In-class demonstration"
        },
        {
          "type": "resource",
          "id": "tunneling-pilot-wave-notebook",
          "mode": "concise",
          "note": "Complete the guided questions before class."
        }
      ]
    }
  ]
}
```

## Implementation stages

### Stage 1 — Content model and validation

- [x] Document the architecture and update plan.
- [ ] Add module metadata under `modules/`.
- [ ] Add stable `id`, `module`, `topics`, `interpretations`, and `level` fields to resource metadata.
- [ ] Do not add course tags to modules or resources.
- [ ] Add a `courses/` format that can reference both modules and resources.
- [ ] Extend `scripts/build-catalog.py` to load modules and collections, resolve references, and validate IDs.
- [ ] Preserve the current `catalog.json` output while introducing a richer `site-data.json` file.

### Stage 2 — Topic homepage and module pages

- [ ] Replace the homepage resource-category tabs with physics-topic groups.
- [ ] Generate or render canonical module landing pages.
- [ ] Keep separate indexes for simulations, notebooks, videos, and other resource types.
- [ ] Add stable "Back to module" navigation to resources.

### Stage 3 — Concise and detailed notebook modes

- [ ] Add shared notebook-mode CSS and JavaScript.
- [ ] Convert one notebook as a pilot, initially Quantum Tunneling.
- [ ] Review the concise version for educational coherence rather than merely hiding arbitrary paragraphs.
- [ ] Migrate other notebooks after the pilot is accepted.

### Stage 4 — Courses and additional collections

- [ ] Render course pages from collection metadata.
- [ ] Allow course entries to choose a notebook mode and add course-specific notes.
- [ ] Add learning paths, workshops, and other curated collections only after the module structure is stable.

## Constraints

- Keep the site static and compatible with GitHub Pages.
- Do not convert the whole site to React.
- Do not introduce a database or content-management system.
- Do not duplicate notebooks for concise and detailed modes.
- Preserve existing URLs during the transition whenever practical.
- Introduce the new model incrementally so current simulations and notebooks continue to work.
