PYTHON ?= .venv/bin/python

.PHONY: venv install tables notebooks validate test smoke smoke-complete build calibrate site
venv:
	python3 -m venv .venv
install: venv
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r requirements-dev.txt

tables:
	$(PYTHON) tools/build_problem_tables.py
notebooks: tables
	$(PYTHON) tools/build_notebooks.py
validate:
	$(PYTHON) tools/validate.py
test:
	$(PYTHON) -m pytest tests text_tests -q
site:
	npm --prefix site run build
smoke:
	$(PYTHON) tools/smoke.py
smoke-complete:
	$(PYTHON) tools/smoke.py --require-complete
build: notebooks validate test
# CUDA required by default. Explicit CPU exploration: make calibrate ID=... ARGS=--allow-cpu
calibrate:
	$(PYTHON) tools/calibrate.py $(ID) $(ARGS)
