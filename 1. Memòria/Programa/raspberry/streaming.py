import subprocess

"""
Al executar aquest codi, es posa en marxa el programa
mjpg-streamer per iniciar la transmissió en directe del
que veu la càmara del robot.
"""

subprocess.run(['/usr/local/bin/mjpg_streamer', "-i", '/usr/local/lib/mjpg-streamer/input_uvc.so -r 1280x720 -d /dev/video0 -f 30', "-o", '/usr/local/lib/mjpg-streamer/output_http.so -p 8090 -w /usr/local/share/mpjg-streamer/www'])
