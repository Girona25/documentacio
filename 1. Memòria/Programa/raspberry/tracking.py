import cv2
import numpy as np
import paho.mqtt.client as mqtt
import json
from time import sleep
from config import host

################################################################
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        client.connected_flag=True
        print("connected OK Returned code=",rc)
    else:
        print("Bad connection Returned code=",rc)
        client.bad_connection_flag=True

def connect_mqtt():
    client = mqtt.Client(client_id)
    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.connect(host, port)
    return client
################################################################
port = 1883

client_id = "stalker"
username = "Stalker"
password = "password"
topic = "Motors"
mbaix=False
mdalt=False
#################################################################
client = connect_mqtt()
client.loop_start()

#cap = cv2.VideoCapture("http://localhost:8090/?action=stream")
grocBajo = np.array([15,100,20],np.uint8)
grocAlto = np.array([45,255,255],np.uint8)
msg_cache= None
while True:
  cap = cv2.VideoCapture("http://localhost:8090/?action=stream")
  ret,frame = cap.read()
  if ret==True:
    frameHSV = cv2.cvtColor(frame,cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(frameHSV,grocBajo,grocAlto)
    contornos,hierachy = cv2.findContours(mask, cv2.RETR_EXTERNAL,  cv2.CHAIN_APPROX_SIMPLE)
    #cv2.drawContours(frame, contornos, -1, (255,0,0), 3)
    areagran=False
    for c in contornos:
      area = cv2.contourArea(c)
      if area > 500:
        M = cv2.moments(c)
        if (M["m00"]==0): M["m00"]=1
        x = int(M["m10"]/M["m00"])
        y = int(M['m01']/M['m00'])
        cv2.circle(frame, (x,y), 7, (0,255,0), -1)
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(frame, '{},{}'.format(x,y),(x+10,y), font, 0.75,(0,255,0),1,cv2.LINE_AA)
        nuevoContorno = cv2.convexHull(c)
        cv2.drawContours(frame, [nuevoContorno], 0, (255,0,0), 3)
        if (area>30000):
            msg = "bkd"
            client.publish(topic, json.dumps([msg, 0.15, 0.15]))
            print('enrera')
        elif (area>10000):
            msg = "stop"
            client.publish(topic, json.dumps([msg]))
            print('stop')
        elif (x>850):
            msg = "fwd"
            client.publish(topic, json.dumps([msg, 0.3, 0.15]))
            print('dreta')
            mbaix=True
        elif (x<500):
            msg = "fwd"
            client.publish(topic, json.dumps([msg, 0.15, 0.3]))
            print('esquerra')
            mbaix=True
        elif (y>600):
            msg = "dwn"
            client.publish(topic, json.dumps([msg, 0.15, 0.15]))
            print('avall')
            mdalt=True
        elif (y<300):
            msg = "up"
            client.publish(topic, json.dumps([msg, 0.15, 0.15]))
            print('amunt')
            mbaix=True
        else :
            msg = "fwd"
            client.publish(topic, json.dumps([msg, 0.15, 0.15]))
            print('endavant')
            mdalt=True
        areagran=True
        break
    if areagran==False or (mbaix==True and mdalt==True):
      msg = "stop"
      client.publish(topic, json.dumps([msg]))
      print("stop no troba")
      mdalt=False
      mbaix=False
    #cv2.imshow('frame',frame)
    if cv2.waitKey(1) & 0xFF == ord('s'):
      break
cap.release()
cv2.destroyAllWindows()
