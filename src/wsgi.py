# This file was created to run the application on heroku using gunicorn.
# Read more about it here: https://devcenter.heroku.com/articles/python-gunicorn

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app import app as application

if __name__ == "__main__":
    application.run()