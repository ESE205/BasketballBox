####################################
# Libraries
####################################
#I2C library
import smbus

#GPIO
import RPi.GPIO as GPIO

#Requests
import requests

#JSON
import json

#Math
import math

#Other
import time, os


####################################
#        User Parameters
#    (Edit these as necessary)
####################################
#Set LIS331 address
addr = 0x19

#Set the acceleration range
maxScale = 400

#Set the LED GPIO pin
LED = 26

#Open file to save all data
#(creates new file in same folder if none
#and appends to existing file)
allData = open("AllSensorData.txt", "a")

#Open file to save alert data
#(creates new file in same folder if none
#and appends to existing file)
alrtData = open("AlertData.txt", "a")


#Open file to save unsent data
#(creates new file in same folder if none
#and appends to existing file)
unsentData = open("UnsentData.txt", "a")

#Open file to save testing data
#(creates new file in same folder if none
#and appends to existing file)
testingData = open("TestingData.txt", "a")

####################################
# Initializations & Functions
# (Leave as-is unless you are
#   comfortable w/ code)
####################################
#LIS331 Constants (see Datasheet)
CTRL_REG1 = 0x20
CTRL_REG4 = 0x23
OUT_X_L = 0x28
OUT_X_H = 0x29
OUT_Y_L = 0x2A
OUT_Y_H = 0x2B
OUT_Z_L = 0x2C
OUT_Z_H = 0x2D

POWERMODE_NORMAL = 0x27
RANGE_100G = 0x00
RANGE_200G = 0x10
RANGE_400G = 0x30


# Create I2C bus
bus = smbus.SMBus(1)

#Initialize GPIO and turn GPIO 26 to low
GPIO.setmode(GPIO.BCM)
GPIO.setup(LED, GPIO.OUT)
GPIO.output(LED, GPIO.LOW)

#Initiliaze LIS331
def initialize(addr, maxScale):
    scale = int(maxScale)
    #Initialize accelerometer control register 1: Normal Power Mode and 50 Hz sample rate
    bus.write_byte_data(addr, CTRL_REG1, POWERMODE_NORMAL)
    #Initialize acceleromter scale selection (6g, 12 g, or 24g). This example uses 24g
    if maxScale == 100:
        bus.write_byte_data(addr, CTRL_REG4, RANGE_100G)
    elif maxScale == 200:
        bus.write_byte_data(addr, CTRL_REG4, RANGE_200G)
    elif maxScale == 400:
        bus.write_byte_data(addr, CTRL_REG4, RANGE_400G)
    else:
        print #"Error in the scale provided -- please enter 100, 200, or 400"


#Function to read the data from accelerometer
def readAxes(addr):
    data0 = bus.read_byte_data(addr, OUT_X_L)
    data1 = bus.read_byte_data(addr, OUT_X_H)
    data2 = bus.read_byte_data(addr, OUT_Y_L)
    data3 = bus.read_byte_data(addr, OUT_Y_H)
    data4 = bus.read_byte_data(addr, OUT_Z_L)
    data5 = bus.read_byte_data(addr, OUT_Z_H)
    #Combine the two bytes and leftshit by 8
    x = data0 | data1 << 8
    y = data2 | data3 << 8
    z = data4 | data5 << 8
    #in case overflow
    if x > 32767 :
        x -= 65536
    if y > 32767:
        y -= 65536
    if z > 32767 :
        z -= 65536
    #Calculate the two's complement as indicated in the datasheet
    x = ~x
    y = ~y
    z = ~z
    return x, y, z

#Function to calculate g-force from acceleration data
def convertToG(maxScale, xAccl, yAccl, zAccl):
    #Caclulate "g" force based on the scale set by user
    #Eqn: (2*range*reading)/totalBits (e.g. 48*reading/2^16)
    X = (2*float(maxScale) * float(xAccl))/(2**16);
    Y = (2*float(maxScale) * float(yAccl))/(2**16);
    Z = (2*float(maxScale) * float(zAccl))/(2**16);
    return X, Y, Z

#def sendToServer(timestamp, x, y, z):

def isDanger(timestamp, x, y, z):
    counter = 0
    x = long(x)
    y = long(y)
    z = long(z)

    if abs(x) > 9 or abs(y) > 9 or abs(z) > 9:
            alrtData.write(str(timestamp) + "\t" + "x: " + str(x) + "\t" + "y: " + str(y) + "\t" + "z: " +  str(z) + "\n")         
            GPIO.output(LED, GPIO.HIGH)
    elif abs(x) > 4 or abs(y) > 4 or abs(z) > 4:
            while abs(x) > 4 or abs(y) > 4 or abs(z) > 4:
                time_start = time.time()
                counter = counter + 1
                if counter > 4:
                    break
            time_end = time.time()
            if (counter > 4):
        #sendToServer(x, y, z, timestamp)
                alrtData.write(str(timestamp) + "\t" + "x: " + str(x) + "\t" + "y: " + str(y) + "\t" + "z: " + str(z) + "\n")
                GPIO.output(LED, GPIO.HIGH)

def sendBatchToServer(xvalues, yvalues, zvalues, timestamps):
    print "Sending data"
    #data = 'data': [ {'x-axis': " + x_values[0] +", 'y-axis': " + y_values[0] +", 'z-axis': " + z_values[0] }"
    data = {
       "data": []
       }
    
    for i in range(0, 49):
        data["data"].append({
            "xAxis":x_values[i],
            "yAxis":y_values[i],
            "zAxis":z_values[i],
            "timestamp":timestamps[i]
        })
            
    #url = "http://192.168.4.1:4000/receiveData"
    #headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    #r = requests.post(url, json.dumps(data), headers=headers)

def checkForDanger(previousFive, timestamp):
    totalVal = 0
    avgVal = 0
    maxVal = 0
    for point in previousFive:
        totalVal += point
        if point > maxVal:
            maxVal = point
       
    avgVal = totalVal / 5
    
    if (maxVal > 30) and (avgVal > 20):
        print "calling send to server"
        sendToServer(int(maxVal), int(avgVal), timestamp)

def sendToServer(maxVal, avgVal, timestamp):
    print "sending to server"
    
    print maxVal
    print avgVal
    
    data = {
        "data": []
        }
    
    data["data"].append({
        "max": maxVal,
        "avg": avgVal,
        "timestamp": timestamp
        })
    
    url = "http://192.168.4.1:4000/receiveData"
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    r = requests.post(url, json.dumps(data), headers=headers)
    
    print "Sent to server"
    

####################################
#       Main Function
####################################
def main():
    print ("Starting stream")
    
    previous = [-1, -1, -1, -1, -1]
    overThreshold = 2
    belowFor = 0

    while True:
        #initialize LIS331 accelerometer
        initialize(addr, 24)

        #Start timestamp
        ts = round(time.time()*1000);
        
        #Write timestamp to AllSensorData file 
        allData.write(str(ts) + "\t")

        #Get acceleration data for x, y, and z axes
        xAccl, yAccl, zAccl = readAxes(addr)
        
        #Calculate G force based on x, y, z acceleration data
        x, y, z = convertToG(maxScale, xAccl, yAccl, zAccl)
        
        #Determine if G force is dangerous to human body & take proper action
        isDanger(ts, x, y, z)

        #Write all sensor data to file AllSensorData (as you probably guessed :) )
        allData.write("x: " + str(x) + "\t" + "y: " + str(y) + "\t" + "z: " + str(z) + "\n")


        #calculate total acceleration
        total = math.sqrt(math.pow(x,2) + math.pow(y,2) + math.pow(z,2))
        
        #print G values (don't need for full installation)
        print "Acceleration in X-Axis : %d" %x
        print "Acceleration in Y-Axis : %d" %y
        print "Acceleration in Z-Axis : %d" %z
        print "Total Acceleration : %d" %total
        print "\n"
        
        #uncomment if testing
        #testingData.write(str(ts) + "\t" + "x: " + str(x) + "\t" + "y: " + str(y) + "\t" + "z: " +  str(z)+ "\t" + "total: " +  str(total) + "\n")

        #update previousFive array
        #previous[0] = previous[1]
        #previous[1] = previous[2]
        #previous[2] = previous[3]
        #previous[3] = previous[4]
        #previous[4] = total
        
        if total > 40 and overThreshold == 2:
            overThreshold = 0
            belowFor = 0
        elif total < 40 and overThreshold == 0:
            belowFor += 1
            if belowFor > 1:
                print "calling check for danger"
                checkForDanger(previous, ts)
                overThreshold = 2
                belowFor = 0
         
        previous[0] = previous[1]
        previous[1] = previous[2]
        previous[2] = previous[3]
        previous[3] = previous[4]
        previous[4] = total
        
            
        #data filtering
        #checkForDanger(previous, ts)
        
        #Short delay to prevent overclocking computer
        time.sleep(0.05)
        
        #data filtering
        
        #if the data point has a value above 70G's, enter this block
        #if(total > 70):
            #increasing = true
          
        #if(increasing):  
            #if(total > currentMax):
                #currentMax = total
            #else:
                #increasing = false
                #saveNextTwo = true
                
        #if(saveNextTwo):
            #counter++
            #if(counter == 2):
                #sendToServer(previousFive)
        

        
    #Run this program unless there is a keyboard interrupt
    try:
        while True:
            pass
    except KeyboardInterrupt:
        myprocess.kill()
        allData.close()
        alrtData.close()
        GPIO.cleanup()


if __name__ =="__main__":
    main()
    allData.close()
    alrtData.close()
    unsentData.close()
    GPIO.cleanup()
