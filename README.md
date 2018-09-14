
# Find My Car - Parking Management System

Find My Car - A cross platform mobile app to assist with finding car indoor and outdoor with the help of BLE and wifi sensors. The app offers two modes, a map mode which works similar to google maps and Augmented Reality (AR) mode, which is still under development but at POC stage and can easily be extended as needed.

The app is most useful for parking systems installed in covered areas, such as malls, parking plazas, basement parking etc where there is no access to GPS signals.

The process to map a vicinity where the app is to be used starts with capturing a north aligned image of the area and then using the following tools to create a usable map for this mobile app.

1. [Grid Map Editor](https://github.com/faisalthaheem/grid-map-editor)
2. [Wifi Access Point Mapper](https://github.com/faisalthaheem/wifi-access-point-mapper)

Once the map is fed into the code and the app is packaged for the particular project, users can find their parked vehicles with the help of ANPR. The user enter their car plate, ANPR system searches the parking lots and returns the position of the parked car on the grid. This information is then used by the app to plot the shortest route from the user's current location to the destination and guide the user to the car.

**Please note this code and it's derivative works for commercial use are licensed free for use only if you share the profits with your employees.**


The following demo videos are at a speed of 16x showing source to destination journey of finding a vehicle. The current location marker keeps jumping around because neighborhood wifi ssids have been used which makes the trasmitted signal strengh unpredictable unlike in a commercially controlled environment where these parameters can be tuned to give a smoother user experience.


|Map Mode|Cam Mode  |
|--|--|
| ![MapMode](https://cdn.rawgit.com/faisalthaheem/findmycar/91fb1cc1/demo/map/map.gif) | ![Cam Mode/Augmented Reality Mode](https://cdn.rawgit.com/faisalthaheem/findmycar/f2541762/demo/cam/cam.gif) |

# Compiling
Please use ionic framework to compile the app.
