#!/usr/bin/python3
import paho.mqtt.client as mqtt
from time import sleep
import subprocess
import json
import RPi.GPIO as GPIO
from gpiozero import PWMOutputDevice as POD
from gpiozero.pins.pigpio import PiGPIOFactory
import gpiozero
from motor import Motor
from orders import Actions
from config import host
from mpu6050 import mpu6050
from hmc5883l import hmc5883l
from ina219 import INA219
from ina219 import DeviceRangeError
import bar30
import time

#########################################################################

class NewProcess():
    """
    Aquesta classe s'utilitza per executar i aturar el mode de
    seguiment d'objectes per color.
    """
    def __init__(self, cmd, Proc: subprocess.Popen = None):
        self.cmd = cmd
        self.newProc = Proc

    def start(self):
        self.newProc = subprocess.Popen(self.cmd, cwd="/home/pi/")

    def kill(self):
        self.newProc.kill()
        
########################################################################

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        client.connected_flag=True
        print("connected OK Returned code=",rc)
        #print(robot.show_values())
        #sleep(2)
    else:
        print("Bad connection Returned code=",rc)
        client.bad_connection_flag=True

def on_message(client, userdata, message):
    """
    Aquesta funcio analitza els topics i el contigut dels
    missatges rebuts i determina quines accions s'ha de 
    executar.
    """
    print("message received ", str(message.payload.decode("utf-8")))
    topic_ = str(message.topic)  
    if topic_ == "Motors":
        msg = json.loads(message.payload.decode()) # Llista de missatges rebuts
        if msg[0] == "up":
            spd_l = float(msg[1])
            spd_r = float(msg[2])
            client.publish(topic, "UP")
            robot.up(spd_l, spd_r)
            
        elif msg[0] == "dwn":
            spd_l = float(msg[1])
            spd_r = float(msg[2])
            client.publish(topic, "DOWN")
            robot.down(spd_l, spd_r)
            
        elif msg[0] == "lleft":
            spd = float(msg[1])
            client.publish(topic, "Left")
            robot.left(spd)
	    
        elif msg[0] == "lright":
            spd = float(msg[1])
            client.publish(topic, "Right")
            robot.right(spd)
	    
        elif msg[0] == "fwd":
            spd_l = float(msg[1])
            spd_r = float(msg[2])
            client.publish(topic, "Move forward")
            robot.forward(spd_l,spd_r)
            
        elif msg[0] == "bkd":
            spd_l = float(msg[1])
            spd_r = float(msg[2])
            client.publish(topic, "Move backward")
            robot.backward(spd_l, spd_r)
            
        elif msg[0] == "left":
            spd = float(msg[1])
            client.publish(topic, "Turn left")
            robot.turn_left(spd)
            
        elif msg[0] == "right":
            spd = float(msg[1])
            client.publish(topic, "Turn right")
            robot.turn_right(spd)
            
        elif msg[0] == "off":
            client.publish(topic, "OFF")
            robot._off()
            
        elif msg[0] == "stopraspy":
            passw= 'raspberry'
            command= 'shutdown -h now'
            command= command.split()
            cmd1=subprocess.Popen(['echo', passw], stdout=subprocess.PIPE)
            cmd2=subprocess.Popen(['sudo','-S']+command, stdin= cmd1.stdout, stdout=subprocess.PIPE)
            
        elif msg[0] == "stopdalt":
            client.publish(topic,"STOP_DALT")
            robot.stop_dalt()

        elif msg[0] == "stopbaix":
            client.publish(topic,"STOP_BAIX")
            robot.stop_baix()

        else:
            client.publish(topic, "STOP")
            robot.stop_all()

    elif topic_ == "Light":
        msg = str(message.payload.decode("utf-8"))
        if msg == "on":
            GPIO.output(33, 1)
        if msg == "off":
            GPIO.output(33, 0)

    elif topic_ == "Camera":
        try:
            subprocess.run(["python3", "take_photos.py"], cwd="/home/pi/")
            client.publish(topic, "Fotografia feta")
        except:
            client.publish(topic, "Error")
            print("Error")
        
    elif topic_ == "Stream":
        msg = str(message.payload.decode("utf-8"))
        print("starting")
        if msg == "play":
            subprocess.Popen(["python3", "streaming.py"], cwd="/home/pi/")
            client.publish(topic, "Start stream")
            
        elif msg == "pause":
            subprocess.run(["sudo", "killall", "mjpg_streamer"])
            client.publish(topic, "Stream finished")
        
    elif topic_ == "Follow":
        msg = str(message.payload.decode("utf-8"))
        if msg == "start":
            tracking.start()
            client.publish(topic, "Start tracking")
        elif msg == "stop":
            tracking.kill()
            client.publish(topic, "Stop tracking")

    elif topic_ == "Info":
        print(robot.value)
       
def connect_mqtt():
    client = mqtt.Client(client_id)
    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.connect(host, port)
    return client


def subscribe(client: mqtt):
    client.subscribe(topics)
    client.on_message = on_message


#######################################################################
mqtt.Client.connected_flag=False

#host = "169.254.10.124"
port = 1883
print(host)
client_id = "Nemo"
username = "Node"
password = "password"

topic = "Server"
topic2 = "Motors"
topic3 = "Camera"
topic4 = "Follow"
topic5 = "Stream"
topic6 = "Sensors"
topic7 = "Light"
topic8 = "Aigua"
topics = [(topic2,0), (topic3, 0), (topic4, 0), (topic5,0), (topic6,0), (topic7,0), (topic8,0)]

cmd = ["python3", "tracking.py"]
tracking = NewProcess(cmd)

robot = Actions(16, 19, 20, 26, 12)

###################################################################
aigua=0
def enviaaigua(channel):
     global aigua
     if aigua==0:
         client.publish("Aigua", "Aigua")
     aigua=1
client = connect_mqtt()
subscribe(client)
rollpitchant=[0,0,0,0]
directionant=0
profant=0
bateriant=0
rollpitch =[0,0,0,0]
direction=0
bateria=0
voltage=0
SHUNT_OHMS = 0.00075
MAX_EXPECTED_AMPS = 100
prof=0
mpu = mpu6050(0x68)
compass = hmc5883l(gauss=4.7, declination =(2,41))
ina = INA219(SHUNT_OHMS, MAX_EXPECTED_AMPS)
ina.configure(ina.RANGE_16V, ina.GAIN_2_80MV)
sensor = bar30.MS5837_30BA()
if not sensor.init():
        print("Sensor could not be initialized")
        exit(1)

# We have to read values from sensor to update pressure and temperature
if not sensor.read():
    print("Sensor read failed!")
    exit(1)

print(("Pressure: %.2f atm  %.2f Torr  %.2f psi") % (
sensor.pressure(bar30.UNITS_atm),
sensor.pressure(bar30.UNITS_Torr),
sensor.pressure(bar30.UNITS_psi)))

print(("Temperature: %.2f C  %.2f F  %.2f K") % (
sensor.temperature(bar30.UNITS_Centigrade),
sensor.temperature(bar30.UNITS_Farenheit),
sensor.temperature(bar30.UNITS_Kelvin)))

freshwaterDepth = sensor.depth() # default is freshwater
sensor.setFluidDensity(bar30.DENSITY_SALTWATER)
saltwaterDepth = sensor.depth() # No nead to read() again
sensor.setFluidDensity(1000) # kg/m^3
print(("Depth: %.3f m (freshwater)  %.3f m (saltwater)") % (freshwaterDepth, saltwaterDepth))

GPIO.setwarnings(False) # Ignore warning for now
GPIO.setmode(GPIO.BOARD) # Use physical pin numbering
GPIO.setup(18, GPIO.IN, pull_up_down=GPIO.PUD_DOWN) # Set pin 10 to be an input pin and set initial value to be pulled low (off)
GPIO.add_event_detect(18,GPIO.FALLING,callback=enviaaigua)
GPIO.setup(19, GPIO.IN, pull_up_down=GPIO.PUD_DOWN) # Set pin 10 to be an input pin and set initial value to be pulled low (off)
GPIO.add_event_detect(19,GPIO.FALLING,callback=enviaaigua)
GPIO.setup(33, GPIO.OUT)
client.loop_start()
while(1):
    rollpitchant=rollpitch
    directionant=direction
    profant=prof
    bateriant=bateria
    rollpitch=mpu.dadesMPU()
    direction=compass.degrees(compass.heading())
    voltatge= ina.voltage()
    bateria=(voltatge-11.1)/1.5*100
    if sensor.read():
                freshwaterDepth = sensor.depth() # default is freshwater
                sensor.setFluidDensity(bar30.DENSITY_SALTWATER)
                saltwaterDepth = sensor.depth() # No nead to read() again
                sensor.setFluidDensity(1000) # kg/m^3
                prof=sensor.depth()
                prof=round(prof,2)
    if prof<=0:
        prof=0
    if bateria<=0:
        bateria=0
    if abs(bateriant-bateria)>=1 or abs(rollpitch[0]-rollpitchant[0])>= 4 or abs(rollpitch[1]-rollpitchant[1])>= 4 or abs(directionant-direction)>=5 or abs(prof-profant)>=0.01:
        msgenv=str([rollpitch[0],rollpitch[1],direction,rollpitch[3], prof, bateria]).encode("utf-8")
        client.publish("Sensors",msgenv)
