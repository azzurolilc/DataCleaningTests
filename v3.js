/* Feb 2016
Import moment, Please, Chart, <some_Json_array>
Load chart @ #canvas 
@testV3 azzurolilc 
*/
var sd,ed,dfc;

function set(sDate,eDate,dfcr){  //dataFilterCriteria =date||week||month; prodIDs=[id1,id2...]
  sd = moment(sDate);//document.getElementById("endDate").value;
  ed = moment(eDate);
  dfc = dfcr;
}
set("1-1-13","1-1-15",10);

var daysInbetween = function(startDate,endDate){
  return moment(endDate).diff(moment(startDate),'days');
}

/*
1. read and grouping by product to dataPrepInit {prodID1:[{rating,date},{rating,date},{}...],prodID2:[{},{},{}]...}
*/
var dataPrepInit = {};

function initalJsonReadFilter(groupingCriteria){
  var prodID, temp = {}, ratingObj = {};

  for (var i=0;i<rp_array.length;i++){
    temp = rp_array[i];
    prodID = temp[groupingCriteria];
    if (!dataPrepInit.hasOwnProperty(prodID)) dataPrepInit[prodID]=[];
    ratingObj = {rating:temp['rating'],date:moment(temp['dateStamp'])};
    dataPrepInit[prodID].push(ratingObj);
  }
}

initalJsonReadFilter('productDbId'); //1

/*
2. Sort each group by date
*/

Array.inSort = function(arr,key){        //insertion sort arr[Objects] by key
  var len = arr.length,
        i,j,value;
    for (i=0; i < len; i++) {
        value = arr[i];
        for (j=i-1; j > -1 && arr[j][key] > value[key]; j--) {
            arr[j+1] = arr[j];
        }
        arr[j+1] = value;
    }
    return arr;
};

function sortData(){
  for (var prop in dataPrepInit){
    Array.inSort(dataPrepInit[prop],"date");
  }
}

sortData(); //2

/*
3. Filter dataPrepInit[] by criterias(key=date) into dataFiltered{}
*/
var dataFiltered = {};

function filterbyCriteria(key,critIni,critEnd){         //filter data by criteria
  var i;
  for (var prop in dataPrepInit){
    dataFiltered[prop]=[];
    for (i=0;i<dataPrepInit[prop].length;i++){
      if (dataPrepInit[prop][i][key]>=critIni&&dataPrepInit[prop][i][key]<=critEnd){
          dataFiltered[prop].push(dataPrepInit[prop][i]);
      }
    }
  }
}

filterbyCriteria("date",sd,ed); //3

/*
4. getX axis value and getY axis value
*/
var getX=[];
var xDisplay=[]
function calcX(n,critIni,critEnd){    //Take in filtered data and combine the rating by user choice[date,week,month]
  var a = critIni;
  while (a<critEnd){
    getX.push(a);
    xDisplay.push(dateFormat(a))
    a=moment(a).add(n, "day");
  }
  getX.push(critEnd);
  xDisplay.push(dateFormat(critEnd));
}

var getY={};
function calcY(){
  for (var key in dataFiltered){  
    getY[key]=[];    
    var trackCount =0, trackSum =0;  
    var i=0,j=0;
    while(i<getX.length-1){
      if((dataFiltered[key].length-j)<=1){ //empty Y array or end of Y array
        getY[key].push(null);
        i++;
      }else{
          //inbetween
          if(dataFiltered[key][j]["date"]>=getX[i]&&(dataFiltered[key][j]["date"]<getX[i+1]||j==dataFiltered[key].length-1)){ 
            trackCount++;
            trackSum+=dataFiltered[key][j]["rating"];
            j++;
          }
          //if y date larger than get[i+1] or at the last one, push to getY
          else if(dataFiltered[key][j]["date"]>getX[i+1]||j==(dataFiltered[key].length-1)){ 
            if(trackCount==0){  
              getY[key].push(null);
            }
            else{
              getY[key].push((trackSum/trackCount));
            }
            trackCount=0;
            trackSum=0;
            i++;
          }
          // if(dataFiltered[key][j]["date"]<getX[i])
          else{                                               
            getY[key].push(null);
            i++;
          }
        }    
    }
    getY[key].push(null);
    console.log(key+" : "+getY[key]);
  }
}

calcX(dfc,sd,ed);  //4
calcY();

function dateFormat(dateStamp){
  return moment(dateStamp).format("dddd, MMMM Do YYYY");
}
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/*
Data Prep and pass for Visualization
*/

function displayDataPrep(){
  var arrDatasets=[],color = Please.make_color({colors_returned: Object.size(getY)}),i=0;
  for (var key in getY){
    console.log(key);
    dsData={label: key,
          fillColor : "rgba(220,220,220,0)",
          strokeColor : color[i],
          pointColor : color[i],
          pointStrokeColor : "#fff",
          pointHighlightFill : "#fff",
          pointHighlightStroke : color[i],
          data:getY[key]
        };
    arrDatasets.push(dsData);
    i++;
  }
  return {labels : xDisplay, datasets: arrDatasets};
}

window.onload = function(){
    var ctx = document.getElementById("canvas").getContext("2d");
    window.myLine = new Chart(ctx).Line(displayDataPrep(), {
      responsive: true,
      scaleShowLabels : true,
      scaleLabel : "<%=value%>",
      scaleFontColor: "#666",

    });
}


