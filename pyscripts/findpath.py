import sys
import numpy as np
from pprint import pprint
import time
import os
import argparse as argparse
import json
import queue

OBSTACLE = 100
INIT_VAL = 10000
DESTINATION = -1

def loadProject(projectFile):

    with open(projectFile) as f:
        return json.load(f)

def searchPath(curLoc, weight=0):
    global project
    global rawMap
    global traversedMap
    global destLoc
    global visitedNodes
    global numRows
    global numCols
    global pathExists

    row = curLoc[0]
    col = curLoc[1]

    #print("[{},{}] [{}]".format(row,col,weight))

    #if we have reached the destination
    if row == destLoc[0] and col == destLoc[1]:
        #print("reached destination")
        traversedMap[destLoc[0]][destLoc[1]] = weight
        pathExists = True
        return

    #proceed further if the weight to get here is lesser than already present weight
    #if traversedMap[row][col] != INIT_VAL and traversedMap[row][col] <= weight:
    if traversedMap[row][col] <= weight:
        #print("limit")
        return
    
    traversedMap[row][col] = weight

    #recurse east
    if col+1 < numCols and rawMap[row][col+1] != OBSTACLE:
        searchPath((row, col+1), weight+1)
    
    #recurse west
    if col-1 > 0 and rawMap[row][col-1] != OBSTACLE:
        searchPath((row,col-1), weight+1)
    
    #recurse north
    if row-1 > 0 and rawMap[row-1][col] != OBSTACLE:
        searchPath((row-1,col), weight+1)
    
    #recurse south
    if row+1 < numRows and rawMap[row+1][col] != OBSTACLE:
        searchPath((row+1,col),weight+1)
    
    # np.savetxt('traversed.txt', traversedMap, '%5d')
    # exit(0)
#depth = 0
def extractPath(curloc, weight):
    global pathTiles
  #  global depth

 #   depth = depth + 1

    row = curloc[0]
    col = curloc[1]

   # pprint(pathTiles)

    # if depth == 20:
    #     exit()

    #return True if we managed to reach the origin
    #return False if we faced a situation where the tiles did not decrease in either direction

    if row == originLoc[0] and col == originLoc[1]:
        return True

    #check east
    if col+1 < numCols and traversedMap[row][col+1] < weight:
        pathTiles.append(curloc)
        if extractPath((row,col+1), traversedMap[row][col]) == False:
            pathTiles.pop()
        else:
            return
    
    #check west
    if col-1 > 0 and traversedMap[row][col-1] < weight:
        pathTiles.append(curloc)
        if extractPath((row,col-1), traversedMap[row][col]) == False:
            pathTiles.pop()
        else:
            return

    #check north
    if row+1 > 0 and traversedMap[row-1][col] < weight:
        pathTiles.append(curloc)
        if extractPath((row-1,col), traversedMap[row][col]) == False:
            pathTiles.pop()
        else:
            return

    #check south
    if row-1 < numRows and traversedMap[row+1][col] < weight:
        pathTiles.append(curloc)
        if extractPath((row+1,col), traversedMap[row][col]) == False:
            pathTiles.pop()
        else:
            return

    return False


def findPath(projectFile, fromRow, fromCol, toRow, toCol):

    global project
    global rawMap
    global traversedMap
    global destLoc
    global originLoc
    global visitedNodes
    global numRows
    global numCols

    project = loadProject(projectFile)
    #pprint(project)

    destLoc = (toRow, toCol)
    originLoc = (fromRow, fromCol)
    numRows = int(project['numRows'])
    numCols = int(project['numCols'])

    #sanity check
    rawMap = np.array(json.loads(project['map']))
    rawMap = np.reshape(rawMap, (numRows, numCols))
    traversedMap = np.full(rawMap.shape,INIT_VAL,dtype='int16')
    
    if (rawMap[fromRow,fromCol] == 100):
        print("Source is Obstacle, cannot navigate.")

    if (rawMap[toRow,toCol] == 100):
        print("Destination is Obstacle, cannot navigate.")

    traversedMap[destLoc[0]][destLoc[1]] = DESTINATION
    searchPath((fromRow,fromCol),0)

    np.savetxt('traversed.txt', traversedMap, '%5d')

    if pathExists:
        extractPath(destLoc, traversedMap[destLoc[0]][destLoc[1]])
        pprint(pathTiles)

project = None
rawMap = None
traversedMap = None
destLoc = None
originLoc = None
visitedNodes = 0
numRows = 0
numCols = 0
pathExists = False
pathTiles = []

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("-pp", "--project.path", required=True,
        help="Path to Find My Car Project file.")
    ap.add_argument("-fr", "--from.row", required=True,
        help="From Row.")
    ap.add_argument("-fc", "--from.col", required=True,
        help="From Column.")
    ap.add_argument("-tr", "--to.row", required=True,
        help="To Row.")
    ap.add_argument("-tc", "--to.col", required=True,
        help="To Column.")
    
    args = vars(ap.parse_args())

    findPath(args['project.path'],int(args['from.row']),int(args['from.col']),int(args['to.row']),int(args['to.col']))

    
    print("\n\nDone...")
