setup:
	pre-commit install --install-hooks

lint:
	npx prettier --check --ignore-unknown .

format:
	npx prettier --write --ignore-unknown .
