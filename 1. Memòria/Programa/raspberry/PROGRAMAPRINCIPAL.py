#!/usr/bin/python3
from time import sleep
import subprocess
import os
import mqtt_client

sleep(60)

while True:
    subprocess.run(["python3", "mqtt_client.py"], cwd="~/")

