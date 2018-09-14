import {Injectable} from '@angular/core';
import { File } from '@ionic-native/file';

@Injectable()
export class MapProvider {

  //constants, internally used
  OBSTACLE: number = 100;
  INIT_VAL: number = 10000;
  DESTINATION: number = -1;

  project: any;
  rawMap: any;
  traversedMap: any
  numRows: number = 0;
  numCols: number = 0;
  pathExists: boolean = false;

  //for current path being searched
  pathTiles = [];
  fromRow: number = -1;
  fromCol: number = -1;
  toRow: number = -1;
  toCol: number = -1;

  constructor(private file: File) { //change here

  }

  loadMap()
  {
    return new Promise((resolve,reject) => {

      //prevent loading over and over again
      if(null != this.project){
        console.log('Map already loaded...');
        resolve();
      }

      this.file.readAsText(this.file.applicationDirectory, 'www/assets/map/map.fmc')
      .then(
        (res) => {
          //console.log(JSON.stringify(JSON.parse(res)));
          this.project = JSON.parse(res);
          resolve();
        }
      )
      .catch(
        (err) => {
          reject('an error occurred ' + err);
      });
    })
  }

  getMapProperty(pName:string)
  {
    //console.log(Object.keys(this.project));
    return this.project[pName];
  }

  getMapImageFileName(){
    return 'assets/map/map.png';
  }

  get2dMap(inputMap){

    var map2d = [];
    while(inputMap.length > 0){
      map2d.push(inputMap.splice(0,this.numCols));
    }
    return map2d;
  }

  getRawMap(){
    var map1d = JSON.parse(this.project['map']);
    //console.log('raw map done');

    return this.get2dMap(map1d);
  }

  getTraversedMap(){
    var map1d = new Array(this.numRows*this.numCols).fill(this.INIT_VAL);
    //console.log('traversed map done');

    return this.get2dMap(map1d);
  }

  findPath(fr, fc, tr, tc)
  {
    return new Promise((resolve,reject) => {

      if(this.project == null){
        reject('Load project first.');
      }

      this.pathExists = false;
      this.pathTiles = [];

      this.fromCol = fc;
      this.fromRow = fr;
      this.toCol = tc;
      this.toRow = tr;

      this.numRows = this.project['numRows'];
      this.numCols = this.project['numCols'];

      //sanity check
      this.rawMap = this.getRawMap();
      this.traversedMap = this.getTraversedMap();

      if( this.rawMap[fr][fc] == this.OBSTACLE){
        reject('Start position is obstacle.');
      }

      if( this.rawMap[tr][tc] == this.OBSTACLE){
        reject('Destination is obstacle.');
      }

      this.traversedMap[tr][tc] = this.DESTINATION;

      //search path
      this.searchPath(fr,fc,0);

      //print
      //console.log(JSON.stringify(this.traversedMap));

      if(this.pathExists){
        //extractpath
        this.extractPath(tr,tc,this.traversedMap[tr][tc]);
        resolve(this.pathTiles.reverse());
      }else{
        reject('Unable to find a path');
      }
    })
  }

  searchPath(row, col, weight = 0){

    if(row == this.toRow && col == this.toCol){
      this.traversedMap[row][col] = weight;
      this.pathExists = true;
      return;
    }

    if(this.traversedMap[row][col] <= weight){
      return;
    }

    this.traversedMap[row][col] = weight;

    //recurse east
    if(col+1 < this.numCols && this.rawMap[row][col+1] != this.OBSTACLE){
      this.searchPath(row, col+1, weight+1);
    }

    //recurse west
    if(col-1 > 0 && this.rawMap[row][col-1] != this.OBSTACLE){
      this.searchPath(row,col-1,weight+1);
    }

    //recurse north
    if(row-1 > 0 && this.rawMap[row-1][col] != this.OBSTACLE){
      this.searchPath(row-1, col, weight+1);
    }

    //recurse south
    if(row+1 < this.numRows && this.rawMap[row+1][col] != this.OBSTACLE){
      this.searchPath(row+1, col, weight+1);
    }

  }

  extractPath(row,col, weight){

    if(row == this.fromRow && col == this.fromCol){
      return true;
    }

    //check east
    if( col+1 < this.numCols && this.traversedMap[row][col+1] < weight){

      this.pathTiles.push([row,col]);
      if(this.extractPath(row,col+1, this.traversedMap[row][col+1]) == false){
        this.pathTiles.pop();
      }else{
        return true;
      }
    }

    //check west
    if( col-1 > 0 && this.traversedMap[row][col-1] < weight){

      this.pathTiles.push([row,col]);
      if(this.extractPath(row,col-1, this.traversedMap[row][col-1]) == false){
        this.pathTiles.pop();
      }else{
        return true;
      }
    }

    //check north
    if( row-1 > 0 && this.traversedMap[row-1][col] < weight){

      this.pathTiles.push([row,col]);
      if(this.extractPath(row-1,col, this.traversedMap[row-1][col]) == false){
        this.pathTiles.pop();
      }else{
        return true;
      }
    }

    //check south
    if( row+1 < this.numRows && this.traversedMap[row+1][col] < weight){

      this.pathTiles.push([row,col]);
      if(this.extractPath(row+1,col, this.traversedMap[row+1][col]) == false){
        this.pathTiles.pop();
      }else{
        return true;
      }
    }

    return false;
  }
}
