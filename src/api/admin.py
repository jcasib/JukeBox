import os
import inspect
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_admin.theme import Bootstrap4Theme
from flask import redirect, url_for, session
from . import models
from .models import db


class SecureModelView(ModelView):
    def is_accessible(self):
        return session.get('admin_logged_in') == True

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin_login'))


class SecureAdminIndexView(AdminIndexView):
    def is_accessible(self):
        return session.get('admin_logged_in') == True

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin_login'))


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    admin = Admin(app, name='4Geeks Admin', theme=Bootstrap4Theme(swatch='cerulean'), index_view=SecureAdminIndexView())

    for name, obj in inspect.getmembers(models):
        if inspect.isclass(obj) and issubclass(obj, db.Model):
            admin.add_view(SecureModelView(obj, db.session))