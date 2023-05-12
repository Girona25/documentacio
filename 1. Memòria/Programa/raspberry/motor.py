from gpiozero import PWMOutputDevice as POD
from gpiozero.pins.pigpio import PiGPIOFactory
import gpiozero
from time import sleep

###############################################

"""
Motor VE:
  - valor > 0.149 --> antihorari. (baixar)
  - valor < 0.149 --> horari.     (pujar)

Motor VD:
  - valor > 0.149 --> antihorari. (pujar)
  - valor < 0.149 --> horari.     (baixar)

Motor HE:
  - valor > 0.149 --> antihorari. (enrera)
  - valor < 0.149 --> horari.     (endavant)

Motor HD:
  - valor > 0.149 --> antihorari. (endavant)
  - valor < 0.149 --> horari.      (enrera)


El motiu pel qual els motors paral·les giren en sentit contrari quan
el vol moure en linea recta es degut a que tenen les hèlix invertides
i d'aquesta forma els moments dels motors s'anulen entre ells donant 
major estabilitat al robot.

"""

class Motor():
    """
    motors

    Aquesta clase defineix l'estat d'un motor.

    Parameters:
      pin :      int
      Número de pin GPIO de la raspberry ha utilitzar.
      
    """

    DEFAULT_SPEED = 0
    
    def __init__(self, pin):
        # Important especificar la llibreria de pins PiGPIO al usar PWM.
        self.motor = POD(pin=pin, pin_factory=PiGPIOFactory())

        # Procés d'inicialització dels motors.
        self.motor.off()
        sleep(0.5)
        self.motor.on()
        sleep(0.5)

        # Per començar a funcionar, es necessari que el valor inicial del pin sigui 0.149
        self.motor.value = 0.149
        self.speed = self.DEFAULT_SPEED

    def motor_speed(self, spd=None):
        """
        Determina la velocitat a la que es mou el motor.

        spd : float, entre 0 i 1
        
        Retorna el valor de velocitat a la que gira el motor.
        """
        if spd is not None:
            self.speed = spd * 0.040
            return self.speed

        return self.speed

    def horari(self, spd=None):
        """
        Fa girar el motor en sentit horari.
        """
        self.motor.value = 0.147 - self.motor_speed(spd)
        print(self.motor.value)
        
    def antihorari(self, spd=None):
        """
        Fa girar el motor en sentit antihorari.
        """
        self.motor.value = 0.153 + self.motor_speed(spd)
        print(self.motor.value)

    def stop(self):
        """
        Atura el motor
        """
        self.motor.value = 0.149
        
    def off(self):
        """
        Apaga el pin
        """
        self.motor.off()
        print('off')

    def on(self):
        """
        Encen el pin
        """
        self.motor.off()
        print("on")

    def show_value(self):
        """
        Mostra el valor del pin.
        """
        print(self.motor.value)
