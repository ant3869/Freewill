# server/setup.py
from setuptools import setup, find_packages

setup(
    name="freewill-server",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "flask",
        "flask-socketio",
        "flask-cors",
    ],
)