release: pipenv run upgrade
web: gunicorn wsgi --chdir ./src/ --worker-class gevent --workers 1 --timeout 0