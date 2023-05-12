from datetime import datetime
from signal import pause
import requests

"""
Al executar aquest codi, captura una imatge i la guarda al
directory /Photos en format ISO.

"""

timestamp = datetime.now().isoformat()
try:
    img = requests.get("http://localhost:8090/?action=snapshot")
    name = ("/home/pi/Photos/%s.jpg" % timestamp)

    with open(name, "wb") as f:
        f.write(img.content)
    f.close()


except:
    from picamera import PiCamera
    PiCamera().capture("/home/pi/Photos/%s.jpg" % timestamp)
    

print("Picture taken")

