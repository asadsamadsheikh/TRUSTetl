# TrustETL - Human Readable Website

This is the human-readable frontend prototype for the TrustETL project.

## Pages

- index.html - Home
- dashboard.html - Dashboard
- about.html - Project overview and research idea
- datasets.html - Dataset list
- upload.html - Dataset upload
- profiling.html - Data profiling
- pipeline.html - ETL execution flow
- coder.html - Coder Agent
- critic.html - Critic Agent
- validator.html - Validator Agent
- lineage.html - Data lineage
- report.html - Final validation report

## Folders

- css/style.css - All website styling
- js/script.js - Upload, drag-and-drop, and small frontend interactions

## How to run

No server is required for this prototype.

1. Extract the ZIP file.
2. Open index.html in a browser.
3. Use the navigation buttons to move through the TrustETL workflow.

## Important

This is a frontend prototype. The Coder Agent, Critic Agent, Validator Agent,
ETL execution, and validation values are currently represented by demo data.

A real implementation can connect these pages to a Python/FastAPI backend,
database, and actual LLM-based agents.
