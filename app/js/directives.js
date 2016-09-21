'use strict';

/* Directives */
var stavrDirts = angular.module('stavrDirectives', []);

stavrDirts.directive('myInfoTableDirective',function(){
   return {
       restrict : 'A',
       transclude: true,
       controller:
       function ($scope,$element,$transclude,$http) {
           $transclude(function(clone){
               $http.get('http://localhost:8080/DataVisualor/TraTableJsonSevlet',{cache:true}).
               success(function(data, status, headers, config) {
                   // this callback will be called asynchronously
                   // when the response is available
                   try {
                       var object = angular.fromJson(data);
                       var head = object.tableHead;
                       var rowData = object.tableData;
                       var htmlStr = "<thead ><tr>";
                       for(var i=0 ; i < head.length;i++)
                       {
                           htmlStr += "<th>" +
                               head[i] +
                               "</th>";
                       }
                       htmlStr +="</tr></thead>";
                       htmlStr +="<tbody>";
                       for(var i=0 ; i < rowData.length;i++)
                       {
                           var rowObject = angular.fromJson(rowData[i]);
                           htmlStr += "<tr>"+
                               "<td>"+rowObject.Num+"</td>"+
                               "<td>"+rowObject.Own+"</td>"+
                               "<td>"+rowObject.Time+"</td>" +
                               "</tr>";
                       }
                       htmlStr +="</tbody>";

                       $element.append(htmlStr);
                   }catch(e)
                   {

                   }

               }).
               error(function(data, status, headers, config) {
                   // called asynchronously if an error occurs
                   // or server returns response with an error status.
               });
           });


       },
       link: function (scope,ele,attrs) {
           return {
               pre: function (tElement,tAttrs,transclude) {

               },
               post:function (scope,iElement,iAttrs,controller) {

               }
           }
       }
   }; 
});

stavrDirts.directive('myDataBaseTable',['$rootScope',function($rootScope){
    return function (scope,ele,attrs){
            attrs.$observe('title',function () {
                if(scope.tableData.length ==0) return;
                var tableElement = ele[0];
                tableElement.innerHTML = scope.tableData;

               scope.table = $(tableElement).DataTable({
                    "paging": true,
                    "lengthChange": true,
                    "searching": true,
                    "ordering": true,
                    "info": true,
                    "autoWidth": true,
                    "select": true
                });

                $('#example1 tbody').on( 'click', 'tr', function () {
                    $(this).toggleClass('active');
                } );               

                
            })
    }
}]);


stavrDirts.directive('myRowDirective',function(){
    return {
        require: '^myInfoTableDirective',
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@'
        },
        link: function(scope, element, attrs, tabsCtrl) {
            tabsCtrl.addRow(scope);

            // Prevent default dragging of selected co
            element.on('mousedown', function(event) {
                event.preventDefault();

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {

                element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        }
    };
});

stavrDirts.directive('myMapChart', ['$interval','MapViewerSever','ActiveDataFactory','StopEventlayerSever', function($interval,MapViewerSever,ActiveDataFactory,StopEventlayerSever) {
    return {
        restrict : 'A',
        transclude: true,
        controller: function ($scope,$element,$transclude,$http) {
           
                
        },
        link:{
            pre: function (scope,iElement,iAttrs,controller) {

            },
            post:function (scope,iElement,iAttrs,controller) {
                var map = MapViewerSever.map;
                map.setTarget(iElement[0]);

                iAttrs.$observe('title',function () {
                    if(ActiveDataFactory.isMapUpdate && ActiveDataFactory.isSelectDataExist()){

                        var map = MapViewerSever.map;
                       // MapViewerSever.removeAllLayers();

                        var trajectoryFeatures = MapViewerSever.trajectoryFeatures;

                        var selectData = ActiveDataFactory.getSelectData();
                        var typeFeature = "MultiLineString";
                        var d3Color = d3.scale.category10();
                        var featureSet = [];

                        for(var i=0;i<selectData.length;i++){
                            var featureObj = {};
                            featureObj.carNumber = selectData[i][0];
                            //var url = ActiveDataFactory.getTrajUrlByCarNumber(carNumber,typeFeature);
                            featureObj.colorLine = d3Color(i);
                            featureSet[i] = featureObj;

                            var feature = new ol.Feature({
                                style:   new ol.style.Style({
                                    stroke: new ol.style.Stroke({
                                        color: featureObj.colorLine,
                                        width: 2
                                    }),
                                    // fill: new ol.style.Fill({
                                    //     color: featureObj.colorLine
                                    // }),
                                    image: new ol.style.Circle({
                                        radius: 7,
                                        fill: new ol.style.Fill({
                                            color: featureObj.colorLine
                                        })
                                    })
                                })
                            });

                            var alpColor = ol.color.asArray(featureObj.colorLine);
                            alpColor = alpColor.slice();
                            alpColor[3] = 0.4;

                            feature.set('name',featureObj.carNumber);
                            feature.set('color',alpColor);
                            feature.set('type',typeFeature);
                            feature.set('date',"2013-3-28");

                            trajectoryFeatures.push(feature);

                        }
                        featureSet.forEach(function (obj) {
                            ActiveDataFactory.callTrajectoryData(obj.carNumber,typeFeature)
                                .then(function (data) {
                                    var trajectoryCoords =data.geometry.coordinates;
                                    var trajectoryTimes = data.geometry.times;
                                    var transformFn = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');

                                    if("MultiLineString"==typeFeature){
                                        for(var i=0;i<trajectoryCoords.length;i++){
                                            trajectoryCoords[i].forEach(function (coord) {
                                                var c = transformFn(coord, undefined, coord.length);
                                                coord[0] = c[0];
                                                coord[1] = c[1];
                                            });
                                        }
                                    }else{
                                        trajectoryCoords.forEach(function (coord) {
                                            var c = transformFn(coord, undefined, coord.length);
                                            coord[0] = c[0];
                                            coord[1] = c[1];
                                        });
                                    }

                                    var features = MapViewerSever.trajectoryFeatures.getArray();
                                    var featureCurrent = features.filter(function(f){ return f.get('name')==obj.carNumber});




                                    function geomCreator(type,coords) {
                                        var geometry = null;
                                        switch (type){
                                            case 'LineString': geometry = new ol.geom.LineString(coords); break;
                                            case 'LinearRing': geometry = new ol.geom.LinearRing(coords); break;
                                            case 'MultiLineString': geometry = new ol.geom.MultiLineString(coords); break;
                                            case 'MultiPoint': geometry = new ol.geom.MultiPoint(coords); break;
                                            case 'MultiPolygon': geometry = new ol.geom.MultiPolygon(coords); break;
                                            case 'Point': geometry = new ol.geom.Point(coords); break;
                                            case 'Polygon': geometry = new ol.geom.Polygon(coords); break;
                                        }
                                        return geometry;
                                    }

                                    var geoM  = geomCreator(typeFeature,trajectoryCoords);
                                    geoM.set("times",trajectoryTimes);

                                    featureCurrent[0].setGeometry(geoM);
                                    var color = featureCurrent[0].get("color");
                                    featureCurrent[0].setStyle( new ol.style.Style({
                                        stroke: new ol.style.Stroke({
                                            color: color,
                                            width: 2
                                        }),
                                        // fill: new ol.style.Fill({
                                        //     color: color
                                        // }),
                                        image: new ol.style.Circle({
                                            radius: 7,
                                            fill: new ol.style.Fill({
                                                color: color
                                            })
                                        })
                                    }));

                                },function (data) {
                                    alert(data);
                                });
                        });

                        ActiveDataFactory.isMapUpdate =false;






                    }
                    ActiveDataFactory.callRelationsData().then(function(data){
                        var nodes = data.nodes;

                        var typeFeature = "MultiPoint";
                        var d3Color = d3.scale.category10();
                        var transformFn = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');
                        for(var i=0;i<nodes.length;i++){
                            var node = nodes[i];
                            var coords = [];
                            coords[0] = node.lon;
                            coords[1] = node.lat;
                            var c = transformFn(coords, undefined, coords.length);

                            var color = d3Color(node.group);

                            var feature = new ol.Feature({
                                geometry: new ol.geom.Point(c),
                                style:   new ol.style.Style({
                                    stroke: new ol.style.Stroke({
                                        color: color,
                                        width: 2
                                    }),
                                    // fill: new ol.style.Fill({
                                    //     color: featureObj.colorLine
                                    // }),
                                    image: new ol.style.Circle({
                                        radius: 7,
                                        fill: new ol.style.Fill({
                                            color: color
                                        })
                                    })
                                })
                            });

                            var alpColor = ol.color.asArray(color);
                            alpColor = alpColor.slice();
                            alpColor[3] = 0.5;

                            // feature.set('name',featureObj.carNumber);
                            feature.set('color',alpColor);
                            feature.set('type',typeFeature);
                            feature.set('time',+node.time);
                            //feature.set('date',"2013-3-28");
                            feature.setStyle(new ol.style.Style({
                                image: new ol.style.Circle({
                                    radius: 5,
                                    // fill: new ol.style.Fill({
                                    //     color: color
                                    // }),
                                   stroke: new ol.style.Stroke({
                                    color: color,
                                    width: 3
                                    })
                                })
                           }));

                            MapViewerSever.eventsFeatures.push(feature);

                        }

                    },function (data) {
                        alert(data);
                    });
                    ActiveDataFactory.callEventData().then(function(data){
                        var dataObj = JSON.parse(data);
                        if(dataObj.length===0) return;
                        var typeFeature = "MultiPoint";
                        var d3Color = d3.scale.category10();
                        var transformFn = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');
                        for(var k=0;k<dataObj.length;k++){
                            var events = dataObj[k].data.Events;
                            for(var i=0;i<events.length;i++) {
                                var event = events[i];
                                var coords = [];
                                coords[0] = event.lon;
                                coords[1] = event.lat;
                                var c = transformFn(coords, undefined, coords.length);

                                var color = d3Color(event.status);

                                var feature = new ol.Feature({
                                    geometry: new ol.geom.Point(c),
                                    style: new ol.style.Style({
                                        stroke: new ol.style.Stroke({
                                            color: color,
                                            width: 2
                                        }),
                                        // fill: new ol.style.Fill({
                                        //     color: featureObj.colorLine
                                        // }),
                                        image: new ol.style.Circle({
                                            radius: 7,
                                            fill: new ol.style.Fill({
                                                color: color
                                            })
                                        })
                                    })
                                });

                                var alpColor = ol.color.asArray(color);
                                alpColor = alpColor.slice();
                                alpColor[3] = 0.5;

                                // feature.set('name',featureObj.carNumber);
                                feature.set('color', alpColor);
                                feature.set('type', typeFeature);
                                feature.set('time', +event.time);
                                //feature.set('date',"2013-3-28");
                                feature.setStyle(new ol.style.Style({
                                    image: new ol.style.Circle({
                                        radius: 5,
                                        // fill: new ol.style.Fill({
                                        //     color: color
                                        // }),
                                        stroke: new ol.style.Stroke({
                                            color: color,
                                            width: 3
                                        })
                                    })
                                }));

                                MapViewerSever.eventsFeatures.push(feature);
                            }
                        }

                    },function(e){alert(e);});


                    // ODLines
                    {
                        var map = MapViewerSever.map;
                        var features = new Array();
                        var coordinates = [[114.224955, 30.5929],[114.237216,30.610683],[114.269286,30.62176],[114.269286,30.62176],[114.300796,30.604683]];
                        var transformedCoordinates = new Array();

                        for (var i = 0; i < coordinates.length; ++i) {
                            transformedCoordinates[i] = ol.proj.transform(coordinates[i], 'EPSG:4326', 'EPSG:3857');
                            features[i] = new ol.Feature(new ol.geom.Point(transformedCoordinates[i]));
                        }

                        var source = new ol.source.Vector({
                            features: features
                        });

                        var clusterSource = new ol.source.Cluster({
                            distance: 40,
                            source: source
                        });

                        var styleCache = {};
                        var clusters = new ol.layer.Vector({
                            source: clusterSource,
                            style: function (feature, resolution) {
                                var size = feature.get('features').length;
                                var style = styleCache[size];
                                if (!style) {
                                    style = [new ol.style.Style({
                                        image: new ol.style.Circle({
                                            radius: 10,
                                            stroke: new ol.style.Stroke({
                                                color: '#fff'
                                            }),
                                            fill: new ol.style.Fill({
                                                color: '#3399CC'
                                            })
                                        }),
                                        text: new ol.style.Text({
                                            text: size.toString(),
                                            fill: new ol.style.Fill({
                                                color: '#fff'
                                            })
                                        })
                                    })];
                                    styleCache[size] = style;
                                }
                                return style;
                            }
                        });

                        map.addLayer(clusters);

                        var vectorLine = new ol.source.Vector({});

                        for (var i = 1; i < transformedCoordinates.length; i++) {
                            var startPoint = transformedCoordinates[0];
                            var endPoint = transformedCoordinates[i];
                            var lineArray = [startPoint, endPoint];
                            var featureLine = new ol.Feature({
                                geometry: new ol.geom.LineString(lineArray)
                            });

                            var lineStyle = new ol.style.Style({
                                fill: new ol.style.Fill({
                                    color: '#00FF00',
                                    weight: 4
                                }),
                                stroke: new ol.style.Stroke({
                                    color: '#00FF00',
                                    width: 2
                                })
                            });
                            featureLine.setStyle(lineStyle);
                            vectorLine.addFeature(featureLine);
                            var firstPoint = coordinates[0];
                            var secondPoint = coordinates[i];
                            var slope = ((secondPoint[1] - firstPoint[1]) / (secondPoint[0] - firstPoint[0]));
                            var angle = Math.atan(slope);
                            var rotation;

                            //Shifting the graph Origin to point of start point
                            secondPoint[0] = secondPoint[0] - firstPoint[0];
                            secondPoint[1] = secondPoint[1] - firstPoint[1];
                            //Fourth quadrant
                            if (secondPoint[0] > 0 && secondPoint[1] < 0) {
                                rotation = (Math.PI / 2 - angle);
                            }
                            //Second quadrant
                            else if (secondPoint[0] < 0 && secondPoint[1] > 0) {
                                rotation = -(Math.PI / 2 + angle);
                            }
                            //Third quadrant
                            else if (secondPoint[0] < 0 && secondPoint[1] < 0) {
                                rotation = 3 * Math.PI / 2 - angle;
                            }
                            //First quadrant
                            else if (secondPoint[0] > 0 && secondPoint[1] > 0) {
                                rotation = angle;
                            }
                            var iconStyle = new ol.style.Style({
                                image: new ol.style.Icon(({
                                    anchorXUnits: 'fraction',
                                    anchorYUnits: 'pixels',
                                    opacity: 0.75,
                                    src: 'img/arrow2.png',
                                    rotation: rotation
                                }))
                            });
                            var iconFeature = new ol.Feature({
                                geometry: new ol.geom.Point(endPoint)
                            });
                            iconFeature.setStyle(iconStyle);
                            vectorLine.addFeature(iconFeature);
                        }
                        var vectorLayer = new ol.layer.Vector({
                            source: vectorLine
                        });
                        map.addLayer(vectorLayer);




                    }




                });
                // add Marker
                for(var i=0; i<0;i++)
                {
                    var markerId = StopEventlayerSever();

                    var pos = ol.proj.fromLonLat([114.3707, 30.52]);

                    // Vienna marker
                    var marker = new ol.Overlay({
                        position: pos,
                        positioning: 'center-center',
                        element: document.getElementById(markerId),
                        stopEvent: false
                    });
                    map.addOverlay(marker);
                }
            }
        }
    }
}]);


/**
 *  Time View group
 */
stavrDirts.directive('myDayHourHeatmap',['$compile','ActiveDataFactory',function($compile,ActiveDataFactory){
    return {
        restrict : 'A',
        transclude: false,
        templateUrl:'template/visualtoolhtml/dayhourheatmap.html',
        controller:function($scope,$element,$transclude,$http){

        },
        link:{
            pre:function(tElement,tAttrs,transclude){},
            post:function(scope,iElement,iAttrs,controller){


                iAttrs.$observe('title',function () {
                    //UI configuration
                    var itemSize = 15,
                        cellSize = itemSize - 1,
                        width = iElement.width(),
                        margin = {top: 20, right: 20, bottom: 20, left: 50};

                    //formats
                    var hourFormat = d3.time.format('%H'),
                        dayFormat = d3.time.format('%j'),
                        timeFormat = d3.time.format('%Y-%m-%dT%X'),
                        monthDayFormat = d3.time.format('%m.%d');

                    //data vars for rendering
                    var dateExtent = null,
                        data = null,
                        dayOffset = 0,
                        colorCalibration = ['#f6faaa', '#FEE08B', '#FDAE61', '#F46D43', '#D53E4F', '#9E0142'],
                        dailyValueExtent = {};

                    //axises and scales
                    var axisHeight = 0,
                        axisWidth = itemSize * 24,
                        yAxisScale = d3.time.scale(),
                        yAxis = d3.svg.axis()
                            .orient('left')
                            .ticks(d3.time.days, 3)
                            .tickFormat(monthDayFormat),
                        xAxisScale = d3.scale.linear()
                            .range([0, axisWidth])
                            .domain([0, 24]),
                        xAxis = d3.svg.axis()
                            .orient('top')
                            .ticks(5)
                            .tickFormat(d3.format('02d'))
                            .scale(xAxisScale);

                    initCalibration();

                    var svg = d3.select('[role="heatmap"]');
                    var heatmap = svg
                        .attr('width', width)
                        // .attr('height',height)
                        .append('g')
                        .attr('width', width - margin.left - margin.right)
                        // .attr('height',height-margin.top-margin.bottom)
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                    var rect = null;
                    /*
                     d3.json('mbar/pm25.json',function(err,data){
                     data = data.data;
                     data.forEach(function(valueObj){
                     valueObj['date'] = timeFormat.parse(valueObj['timestamp']);
                     var day = valueObj['day'] = monthDayFormat(valueObj['date']);

                     var dayData = dailyValueExtent[day] = (dailyValueExtent[day] || [1000,-1]);
                     var pmValue = valueObj['value']['PM2.5'];
                     dayData[0] = d3.min([dayData[0],pmValue]);
                     dayData[1] = d3.max([dayData[1],pmValue]);
                     });

                     dateExtent = d3.extent(data,function(d){
                     return d.date;
                     });

                     axisHeight = itemSize*(dayFormat(dateExtent[1])-dayFormat(dateExtent[0])+1);

                     svg.attr('height',axisHeight+margin.top+margin.bottom);

                     //render axises
                     yAxis.scale(yAxisScale.range([0,axisHeight]).domain([dateExtent[0],dateExtent[1]]));
                     svg.append('g')
                     .attr('transform','translate('+margin.left+','+margin.top+')')
                     .attr('class','x axis')
                     .call(xAxis)
                     .append('text')
                     .text('time')
                     .attr('transform','translate('+axisWidth+',-10)');

                     svg.append('g')
                     .attr('transform','translate('+margin.left+','+margin.top+')')
                     .attr('class','y axis')
                     .call(yAxis)
                     .append('text')
                     .text('date')
                     .attr('transform','translate(-'+margin.left +','+axisHeight+')');

                     //render heatmap rects
                     dayOffset = dayFormat(dateExtent[0]);
                     rect = heatmap.selectAll('rect')
                     .data(data)
                     .enter().append('rect')
                     .attr('width',cellSize)
                     .attr('height',cellSize)
                     .attr('y',function(d){
                     return itemSize*(dayFormat(d.date)-dayOffset);
                     })
                     .attr('x',function(d){
                     return hourFormat(d.date)*itemSize;
                     })
                     .attr('fill','#ffffff');

                     rect.filter(function(d){ return d.value['PM2.5']>0;})
                     .append('title')
                     .text(function(d){
                     return monthDayFormat(d.date)+' '+d.value['PM2.5'];
                     });

                     renderColor();
                     });*/

                    ActiveDataFactory.callEventData().then(function (data) {
                        var dataObj = JSON.parse(data);
                        var matrixData = [];
                        if (dataObj.length <= 0) return;
                        for (var k = 0; k < dataObj.length; k++) {
                            var eventArr = dataObj[k].data.Events;

                            for (var i = 0; i < eventArr.length; i++) {
                                var dateStr = Number(eventArr[i].time + '000');
                                var date = new Date(dateStr);
                                var hour = date.getHours();

                                var dateS = date.toDateString();
                                var dateUnit = new Date(dateS);
                                dateUnit.setHours(hour);

                                var itemDate = matrixData.find(function (e) {
                                    return e.date.getTime() == dateUnit.getTime();
                                });
                                if (itemDate) {
                                    itemDate.value += 1;
                                }
                                else {
                                    for(var j=0;j<24;j++){
                                        var dateU = new Date(dateS);
                                        dateU.setHours(j);
                                        var matrixUnit = {date: dateU, value: 1}
                                        matrixData.push(matrixUnit);
                                    }

                                }

                            }
                        }

                        //render
                        matrixData.forEach(function (valueObj) {
                            //valueObj['date'] = timeFormat.parse(valueObj['timestamp']);
                            var day = valueObj['day'] = monthDayFormat(valueObj['date']);

                            var dayData = dailyValueExtent[day] = (dailyValueExtent[day] || [1000, -1]);
                            var value = valueObj['value'];
                            dayData[0] = d3.min([dayData[0], value]);
                            dayData[1] = d3.max([dayData[1], value]);
                        });

                        dateExtent = d3.extent(matrixData, function (d) {
                            return d.date;
                        });

                        axisHeight = itemSize * (dayFormat(dateExtent[1]) - dayFormat(dateExtent[0]) + 1);

                        svg.attr('height', axisHeight + margin.top + margin.bottom);

                        //render axises
                        yAxis.scale(yAxisScale.range([0, axisHeight]).domain([dateExtent[0], dateExtent[1]]));
                        svg.append('g')
                            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                            .attr('class', 'x axis')
                            .call(xAxis)
                            .append('text')
                            .text('time')
                            .attr('transform', 'translate(' + axisWidth + ',-10)');

                        svg.append('g')
                            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                            .attr('class', 'y axis')
                            .call(yAxis)
                            .append('text')
                            .text('date')
                            .attr('transform', 'translate(-' + margin.left + ',' + axisHeight + ')');

                        //render heatmap rects
                        dayOffset = dayFormat(dateExtent[0]);
                        rect = heatmap.selectAll('rect')
                            .data(matrixData)
                            .enter().append('rect')
                            .attr('width', cellSize)
                            .attr('height', cellSize)
                            .attr('y', function (d) {
                                return itemSize * (dayFormat(d.date) - dayOffset);
                            })
                            .attr('x', function (d) {
                                return hourFormat(d.date) * itemSize;
                            })
                            .attr('fill', '#ffffff');

                        rect.filter(function (d) {
                                return d.value > 0;
                            })
                            .append('title')
                            .text(function (d) {
                                return monthDayFormat(d.date) + ' ' + d.value;
                            });

                        renderColor();


                    }, function (data) {
                        alert(data);
                    });

                    function initCalibration() {
                        d3.select('[role="calibration"] [role="example"]').select('svg')
                            .selectAll('rect').data(colorCalibration).enter()
                            .append('rect')
                            .attr('width', cellSize)
                            .attr('height', cellSize)
                            .attr('x', function (d, i) {
                                return i * itemSize;
                            })
                            .attr('fill', function (d) {
                                return d;
                            });

                        //bind click event
                        d3.selectAll('[role="calibration"] [name="displayType"]').on('click', function () {
                            renderColor();
                        });
                    }

                    function renderColor() {
                        var renderByCount = false;

                        rect
                            .filter(function (d) {
                                return (d.value >= 0);
                            })
                            .transition()
                            .delay(function (d) {
                                return (dayFormat(d.date) - dayOffset) * 15;
                            })
                            .duration(500)
                            .attrTween('fill', function (d, i, a) {
                                //choose color dynamicly
                                var colorIndex = d3.scale.quantize()
                                    .range([0, 1, 2, 3, 4, 5])
                                    .domain((renderByCount ? [0, 500] : dailyValueExtent[d.day]));

                                return d3.interpolate(a, colorCalibration[colorIndex(d.value)]);
                            });
                    }

                    //extend frame height in `http://bl.ocks.org/`
                    d3.select(self.frameElement).style("height", "600px");

                });
            }
        }
    }
}]);

stavrDirts.directive('myLineChart', ['$interval','MapViewerSever','ActiveDataFactory','$compile', function($interval,MapViewerSever,ActiveDataFactory,$compile) {
    return {
        restrict : 'A',
        transclude: false,
        templateUrl:'template/visualtoolhtml/boxTimeLineTemplate.html',
        controller: function ($scope,$element,$transclude,$http,$compile) {

            var selectedData = ActiveDataFactory.getSelectData();
            var dateRange = ActiveDataFactory.getDateRange();
            $scope.isPlay = false;
            $scope.playShow = "block";
            $scope.pasueShow = "none";
            $scope.changePlayState = function(){
                $scope.isPlay = !$scope.isPlay;
                if($scope.isPlay){
                    $scope.playShow = "none";
                    $scope.pasueShow = "block";
                }else{
                    $scope.playShow = "block";
                    $scope.pasueShow = "none";
                }

            };

            $scope.isShowTimeLine = "block";
            $scope.isShowCalendar = "none";
            $scope.isShowTimeCycle = "none";
            $scope.timeViewRadiosClick = function(){
                if($element.find('#radio1')[0].checked) {
                    $scope.isShowTimeLine = "block";
                    $scope.isShowCalendar = "none";
                    $scope.isShowTimeCycle = "none";
                }
                if($element.find('#radio2')[0].checked) {
                    $scope.isShowTimeLine = "none";
                    $scope.isShowCalendar = "block";
                    $scope.isShowTimeCycle = "none";
                    // if(!$element.find('#myDayHourHeatMap')[0]){
                    //     $element.find('#calendarChart')[0].append($compile("<div my-day-hour-heatmap></div>")($scope));
                    // }
                }
                if($element.find('#radio3')[0].checked) {
                    $scope.isShowTimeLine = "none";
                    $scope.isShowCalendar = "none";
                    $scope.isShowTimeCycle = "block";
                }
            };

            $scope.isUpdateCalendar = false;

        },
        link:{
                pre: function (tElement,tAttrs,transclude) {

                },
                post:function (scope,iElement,iAttrs,controller) {

                    // Control tiemline  displayer
                    var margin = {top: 10, right: 30, bottom: 40, left: 30},
                        width = iElement.width() * 0.65 - margin.left - margin.right,
                        parentHeight = 120,
                        height = parentHeight - margin.top - margin.bottom;

                    var timeLineBarDOM = iElement.find("#timaLineBar")[0];
                    var svg = d3.select(timeLineBarDOM).append("svg")
                        .attr("width",  iElement.width() * 0.65 )
                        .attr("height", parentHeight);

                    svg.append("defs").append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("width", width)
                        .attr("height", height);

                    var context = svg.append("g")
                        .attr("class", "context")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    function brushed() {
                        // x.domain(brush.empty() ? x2.domain() : brush.extent());
                        // focus.select(".line").attr("d", area);
                        // focus.select(".x.axis").call(xAxis);

                        if(scope.brush.empty()){
                            scope.pause();
                            clearHighlighdPoints();
                        }else
                        {
                            //choose features in this brush domain
                            updateSelectedPoints(scope.brush.extent());
                        };
                    }

                    function brushStart(){
                        scope.pause();
                    }

                    scope.x = d3.time.scale().range([0, width]),
                        scope.y = d3.scale.linear().range([height, 0]);


                    var xAxis = d3.svg.axis().scale(scope.x).orient("bottom"),
                        yAxis = d3.svg.axis().scale(scope.y).orient("left");



                    var area = d3.svg.line()
                        .x(function(d) { return scope.x(d.date); })
                        .y(function(d) { return scope.y(d.count); });

                    var EventData = [];
                    var endTime = 0;
                    var startTime = Date.now();

                    // event time graph
                    function renderTimeGraph(data) {
                        if (data.length > 0) {
                            var color = d3.scale.category10();

                            var boxTitle = iElement[0].children[0].children[0];
                            boxTitle.innerText = iElement.attr('my-line-chart');
                            var boxBody = iElement.context.lastChild;
                            var width = boxBody.offsetWidth;
                            if (width <= 0) return;

                            // create chart function
                            var eventDropsChart = d3.chart.eventDrops()
                                .eventLineColor(function (datum, index) {
                                    return color(index);
                                })
                                .start(new Date(startTime))
                                .end(new Date(endTime))
                                .width(width)
                                .eventZoom(function(e){

                                })
                                .axisFormat(function(axis){

                                });


                            // bind data with DOM
                            var element = d3.select(iElement.find("#eventDrop")[0]).datum(data);

                            // draw the chart
                            eventDropsChart(element);
                        }
                    }


                    iAttrs.$observe('title',function () {

                        var month = 30 * 24 * 60 * 60 * 1000;
                        var hours = 60 * 60 * 1000;
                        EventData = [];

                        ActiveDataFactory.callEventData().then(function (data) {
                            var dataObj = JSON.parse(data);
                            if(dataObj.length===0) return;
                            var dataCount = [];
                            var maxCount = 0;
                            for (var k = 0; k < dataObj.length; k++) {
                                var name = dataObj[k].data.Name;
                                var eventArr = dataObj[k].data.Events;
                                var event = {
                                    name: name,
                                    dates: []
                                };
                                if (eventArr.length <= 0) continue;
                                for (var i = 0; i < eventArr.length; i++) {
                                    var dateStr = Number(eventArr[i].time + '000');
                                    var date = new Date(dateStr);
                                    var time = date.getTime();
                                    if (time < startTime) startTime = time;
                                    if (time > endTime) endTime = time;
                                    event.dates.push(date);
                                    var dateS   = date.toDateString();
                                    var itemDate = dataCount.find(function(e){ return e.date.toDateString() == dateS});
                                    if(itemDate){
                                        itemDate.count +=1;
                                    }
                                    else{
                                        var bar = { date:date,count:1};
                                        dataCount.push(bar);
                                    }
                                    if(itemDate && (itemDate.count > maxCount)) maxCount = itemDate.count ;
                                }
                                EventData.push(event);
                            }


                            renderTimeGraph(EventData);

                            dataCount.sort(function(a,b){
                                if(a.date > b.date){
                                    return 1;
                                }
                                else{
                                    return -1;
                                }
                            });

                            scope.x.domain([new Date(startTime),new Date(endTime)]);//d3.extent(dataCount.map(function(d){return d.date;})));
                            scope.y.domain([0,maxCount]);
                            xAxis = d3.svg.axis().scale( scope.x).orient("bottom"),
                                yAxis = d3.svg.axis().scale(scope.y).orient("left");
                            scope.brush = d3.svg.brush()
                                .x(scope.x)
                                .on("brush", brushed)
                                .on("brushstart", brushStart);



                            context.selectAll("path").remove();
                            context.selectAll("g").remove();
                            context.append("path")
                                .datum(dataCount)
                                .attr("class", "line")
                                .attr("d", area);

                            context.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + height + ")")
                                .call(xAxis);

                            context.append("g")
                                .attr("class", "y axis")
                                .call(yAxis);

                            context.append("g")
                                .attr("class", "x brush")
                                .call(scope.brush)
                                .selectAll("rect")
                                .attr("y", -6)
                                .attr("height", height + 7);


                            scope.isUpdateCalendar =  !scope.isUpdateCalendar;

                        }, function (data) {
                            alert(data);
                        });

                    });



                    var resizeView = function(){
                        var newWidth = iElement.width() * 0.65 - margin.left - margin.right;
                        if(newWidth<=0 || width == newWidth) return;
                        width = newWidth;
                        height = parentHeight - margin.top - margin.bottom;
                        svg.attr("width",  iElement.width() * 0.65 );
                        svg.select("defs").select("clipPath")
                            .select("rect")
                            .attr("width", width)
                            .attr("height", height);
                        scope.x = d3.time.scale().range([0, width]),
                            scope.y = d3.scale.linear().range([height, 0]);
                        scope.x.domain([new Date(startTime),new Date(endTime)]);
                        scope.brush = d3.svg.brush()
                            .x(scope.x)
                            .on("brush", brushed)
                            .on("brushstart", brushStart);

                        renderTimeGraph(EventData);
                    };

                    var timer;
                    var updateScene = function () {
                        resizeView();
                        // timer = setTimeout(updateScene, 1000);
                    };
                    //updateScene();

                    //Animation button control
                    var timerAinmation = null, speedAnimation = 100;
                    scope.play = function(){
                        if(scope.brush.empty())
                        {
                            return alert("Need brush the timeline");
                        }
                        if(scope.isPlay){
                            if(timerAinmation)clearTimeout(timerAinmation), speedAnimation = 100;
                            scope.changePlayState();
                            return ;
                        }
                        else{
                            scope.changePlayState();
                        }
                        var z = [];
                        //z[0] = new Date(startTime);
                        var brushBackRectWidth = context.select(".brush").select(".background").attr("width");
                        var brushRect = context.select(".brush").select(".extent");
                        var x_w = +brushRect.attr("x");
                        var widthRect = +brushRect.attr("width");
                        var x_e = x_w + widthRect;
                        z[0] = scope.x.invert(x_w);
                        z[1] = scope.x.invert(x_e);
                        // brush.extent(z);


                        var player = function(){
                            // z[0].setDate(z[0].getDate() + 1);
                            // z[1].setDate(z[1].getDate() + 1);
                            var xOffset = x_w++;// scope.x(z[0]);
                            var xEOffset = xOffset + widthRect;
                            if(brushBackRectWidth < xEOffset){
                                x_w = 0;
                                xOffset = 0;
                                xEOffset = xOffset + widthRect;
                            }
                            z[0] = scope.x.invert(xOffset);
                            z[1] = scope.x.invert(xEOffset);
                            updateSelectedPoints(z);
                            brushRect.attr("x",xOffset);
                            timerAinmation = setTimeout(player,speedAnimation);
                        };
                        player();

                    };

                    scope.pause = function(){
                        if(scope.isPlay){
                            if(timerAinmation)clearTimeout(timerAinmation), speedAnimation = 1000;
                            scope.changePlayState();
                        }
                    };

                    scope.forward = function(){
                        if(speedAnimation>30)speedAnimation *= 0.8;
                    };

                    scope.backward = function(){
                        if(speedAnimation<1000)speedAnimation *= 1.3;
                    };



                    // selected features points  by  brush
                    function updateSelectedPoints(brushExtent){
                        var timeRange = [];
                        timeRange[0] = brushExtent[0].getTime()/1000;
                        timeRange[1] = brushExtent[1].getTime()/1000;

                        if(scope.isBind2Trajectory){
                            MapViewerSever.selectTrajectoryFeaturesByUTCTime(timeRange);
                        }
                        if(scope.isBind2Events){
                            MapViewerSever.selectEventsFeaturesByUTCTime(timeRange);
                        }

                    }
                    function clearHighlighdPoints(){
                        MapViewerSever.clearHighlightFeatures();
                        if(scope.isBind2Events){
                            var timeRange =[];
                            timeRange[0] = startTime/1000;
                            timeRange[1] = endTime/1000;
                            MapViewerSever.selectEventsFeaturesByUTCTime(timeRange);
                        }
                    };



                }
            }
        }
}]);


/**
 *  Graph View group
 */
stavrDirts.directive('myGraphChart', ['$interval','ActiveDataFactory', function($interval,ActiveDataFactory) {
    return {
        restrict : 'A',
        transclude: false,
        templateUrl:'template/visualtoolhtml/boxRelationGraphTemplate.html',
        controller: function ($scope,$element,$transclude,$http) {


        },
        link:{
            pre: function (tElement,tAttrs,transclude) {

            },
            post:function (scope,iElement,iAttrs,controller) {

                scope.isShowForceTool = "none";
                scope.isShowMatrixGraph = "block";
                scope.isShowNLGraph = "none";


                scope.toggleForceTool = function(){
                    switch(scope.isShowForceTool){
                        case "block" : scope.isShowForceTool = "none"; break;
                        case "none": scope.isShowForceTool = "block"; break;
                    }
                };

                scope.toggleMatrixGraph = function () {
                    switch(scope.isShowMatrixGraph){
                        case "block" : scope.isShowMatrixGraph = "none"; break;
                        case "none": scope.isShowMatrixGraph = "block"; break;
                    }
                };

                scope.toggleNLGraph = function(){
                    switch(scope.isShowNLGraph){
                        case "block" : scope.isShowNLGraph = "none"; break;
                        case "none": scope.isShowNLGraph = "block"; break;
                    }
                };

                // charge
                iElement.find('#range_1').ionRangeSlider({
                    min: -3000,
                    max: 3000,
                    from: -2000,
                    type: 'single',
                    step: 10,
                    prettify: false,
                    grid: true
                });
                // Friction
                iElement.find('#range_2').ionRangeSlider({
                    min: -1,
                    max: 1,
                    from:0.9,
                    type: 'single',
                    step: 0.01,
                    prettify: false,
                    grid: true
                });
                // Gravity
                iElement.find('#range_3').ionRangeSlider({
                    min: -1,
                    max: 1,
                    from:0.85,
                    type: 'single',
                    step: 0.01,
                    prettify: false,
                    grid: true
                });
                //LinkDistance
                iElement.find('#range_4').ionRangeSlider({
                    min: -1000,
                    max: 1000,
                    from: -20,
                    type: 'single',
                    step: 1,
                    prettify: false,
                    grid: true
                });

                scope.resetForceTool = function(){
                    iElement.find('#range_1').data("ionRangeSlider").reset();
                    iElement.find('#range_2').data("ionRangeSlider").reset();
                    iElement.find('#range_3').data("ionRangeSlider").reset();
                    iElement.find('#range_4').data("ionRangeSlider").reset();
                };

                var force;

                function name(d) { return d.name; }
                function group(d) { return d.group; }

                var color = d3.scale.category10();
                // var color = function(i){
                //     if(i==1) return '#1f77b4';
                //     else return '#ff7f0e';
                // };
                function colorByGroup(d) { return color(group(d)); }

                var boxTitle = iElement[0].children[0].children[0];
                boxTitle.innerText = iElement.attr('my-graph-chart');
                var boxBody = iElement.context.lastChild;
                var width = boxBody.offsetWidth;
                if(width<=0) return;
                var height = width * 0.5;

                var nodelinkGraph = iElement.find('#nodeLinkGraph')[0];
                var svg = d3.select(nodelinkGraph)
                    .append('svg')
                    .attr('width', width-20)
                    .attr('height', height);

                // globe variable
                var node, link,nodes_labels;
                var matrix = [],
                    nodes = [],
                    nLength = 0;

                var voronoi = d3.geom.voronoi()
                    .x(function(d) { return d.x; })
                    .y(function(d) { return d.y; })
                    .clipExtent([[10, 10], [width-20, height-20]]);

                function recenterVoronoi(nodes) {
                    var shapes = [];
                    voronoi(nodes).forEach(function(d) {
                        if ( !d.length ) return;
                        var n = [];
                        d.forEach(function(c){
                            n.push([ c[0] - d.point.x, c[1] - d.point.y ]);
                        });
                        n.point = d.point;
                        shapes.push(n);
                    });
                    return shapes;
                }

                force = d3.layout.force()
                    .charge(-2000)
                    .gravity(1)
                    .friction(0.9)
                    .linkDistance(-20)
                    .size([width,height]);

                force.on('tick', function() {
                    if(!node || !link) return;

                    node.attr('transform', function(d) { return 'translate('+d.x+','+d.y+')'; })
                        .attr('clip-path', function(d) { return 'url(#clip-'+d.index+')'; });

                    link.attr('x1', function(d) { return d.source.x; })
                        .attr('y1', function(d) { return d.source.y; })
                        .attr('x2', function(d) { return d.target.x; })
                        .attr('y2', function(d) { return d.target.y; });

                    nodes_labels.attr("x", function (d) {  return d.x;  });
                    nodes_labels.attr("y", function (d) {  return d.y;  });


                    var clip = svg.selectAll('.clip')
                        .data( recenterVoronoi(node.data()), function(d) { return d.point.index; } );

                    clip.enter().append('clipPath')
                        .attr('id', function(d) { return 'clip-'+d.point.index; })
                        .attr('class', 'clip');
                    clip.exit().remove();

                    clip.selectAll('path').remove();
                    clip.append('path')
                        .attr('d', function(d) { return 'M'+d.join(',')+'Z'; });
                });

                // force graph render
                var renderForceGraph = function(data){

                    link = svg.selectAll('.link')
                        .data( data.links )
                        .enter().append('line')
                        .attr('class', 'link')
                        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

                    node = svg.selectAll('.node')
                        .data( data.nodes )
                        .enter().append('g')
                        .attr('title', name)
                        .attr('class', 'node')
                        .call( force.drag );


                    node.append('circle')
                        .attr('r', 10)
                        .attr('fill', colorByGroup)
                        .attr('fill-opacity', 0.5);

                    node.append('circle')
                        .attr('r', 3)
                        .attr('stroke', 'black');

                    //标签
                    nodes_labels = svg.selectAll("text")
                        .data(data.nodes)
                        .enter()
                        .append('text')
                        .attr("dx", function (d, i) {
                            return (data.nodes[i].name.length);
                        })
                        .attr("dy", 5)
                        .attr("fill", "#fff")
                        .style("font-size", 16)
                        .text(function (d, i) {
                            return data.nodes[i].name;
                        })
                        .attr("onselectstart","return false");

                    force
                        .nodes( data.nodes )
                        .links( data.links )
                        .start();
                };


                // matrix  graph
                var matrixGraphDiv = iElement.find("#matrixGraph")[0];

                var renderMatrixGraph = function(){
                    if(nLength<=0) return ;
                        var margin = {top: 15, right: 15, bottom: 15, left: 15};
                        var widthMatrix =  width - margin.left - margin.right;
                        var heightMatrix = width - margin.top-margin.bottom;



                        var x = d3.scale.ordinal().rangeBands([0, widthMatrix]),
                            z = d3.scale.linear().domain([0, 4]).clamp(true),
                            c = d3.scale.category10().domain(d3.range(10));
                        var colorIndex = d3.scale.quantize().range([0,1,2,3,4,5,6,7,8]);    // weight of relation

                    // Precompute the orders.
                    var orders = {
                        name: d3.range(nLength).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
                        count: d3.range(nLength).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
                        group: d3.range(nLength).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
                    };

                    // The default sort order.
                    x.domain(orders.name);
                    if(nLength>0)colorIndex.domain([nodes[0].count,nodes[nLength-1].count]);

                    var  colorCalibration = [' #f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b'];

                    function initCalibration(){
                        var cellSize = 14,
                            itemSize = 15,
                            textWidth = 30,
                            text2Width  = 40;

                        var svgColorCal = d3.select(matrixGraphDiv).append("svg").attr('width',9*itemSize + textWidth + text2Width).attr('height',itemSize);

                        svgColorCal.append("text")
                            .attr("x",0)
                            .attr("y",itemSize/2)
                            .attr("dy", ".32em")
                            .text("weak");
                        svgColorCal.selectAll('rect').data(colorCalibration).enter()
                            .append("rect")
                            .attr('width',cellSize )
                            .attr('height',cellSize )
                            .attr("dy", ".32em")
                            .attr('x',function(d,i){
                                return i*itemSize+textWidth ;
                            })
                            .attr('fill',function(d){
                                return d;
                            });
                        svgColorCal.append('text')
                            .attr("dy", ".32em")
                            .attr('x',9*itemSize+textWidth)
                            .attr("y",itemSize/2)
                            .text("strong");

                        //bind click event
                        d3.selectAll('[role="calibration"] [name="displayType"]').on('click',function(){
                            renderColor();
                        });
                    }
                    d3.select(matrixGraphDiv).selectAll("svg").remove();

                    initCalibration();

                        var matrixGraphSVG = d3.select(matrixGraphDiv).append("svg")
                            .attr("width", width)
                            .attr("height", width)
                            // .style("margin-left", -margin.left + "px")
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


                        matrixGraphSVG.append("rect")
                            .attr("class", "background")
                            .attr("width", widthMatrix)
                            .attr("height", heightMatrix)
                            .style("fill", '#eee');

                        var row = matrixGraphSVG.selectAll(".row")
                            .data(matrix)
                            .enter().append("g")
                            .attr("class", "row")
                            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
                            .each(row);

                        row.append("line")
                            .attr("x2", widthMatrix)
                            .style("stroke", '#fff');

                        row.append("text")
                            .attr("x", -6)
                            .attr("y", x.rangeBand() / 2)
                            .attr("dy", ".32em")
                            .attr("text-anchor", "end")
                            .style("fill", function(d,i){return c(nodes[i].group)})
                            .text(function(d, i) { return nodes[i].name; });

                        var column = matrixGraphSVG.selectAll(".column")
                            .data(matrix)
                            .enter().append("g")
                            .attr("class", "column")
                            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

                        column.append("line")
                            .attr("x1", -widthMatrix)
                            .style("stroke", '#fff');

                        column.append("text")
                            .attr("x", 6)
                            .attr("y", x.rangeBand() / 2)
                            .attr("dy", ".32em")
                            .attr("text-anchor", "start")
                            .style("fill", function(d,i){return c(nodes[i].group)})
                            .text(function(d, i) { return nodes[i].name; });

                        function row(row) {
                            var cell = d3.select(this).selectAll(".cell")
                                .data(row.filter(function(d) { return d.z; }))
                                .enter().append("rect")
                                .attr("class", "cell")
                                .attr("x", function(d) { return x(d.x); })
                                .attr("width", x.rangeBand())
                                .attr("height", x.rangeBand())
                                .style("fill-opacity", function(d) {
                                    return nodes[d.x].group == nodes[d.y].group ?z(d.z) : 1 ;
                                })
                                .style("fill", function(d) {
                                    // console.log("d is "+d + "  nodes[d.x].group is "+nodes[d.x].group+"  ;   nodes[d.y].group is "+nodes[d.y].group);
                                    return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : colorCalibration[colorIndex(d.z)];
                                })
                                .on("mouseover", mouseover)
                                .on("mouseout", mouseout);
                        }

                        function mouseover(p) {
                            d3.selectAll(".row text").classed("active", function(d, i) {
                                return i == p.y;
                            });
                            d3.selectAll(".column text").classed("active", function(d, i) {
                                return i == p.x;
                            });
                        }

                        function mouseout() {
                            d3.selectAll("text").classed("active", false);
                        }

                        d3.select("#order").on("change", function() {
                            clearTimeout(timeout);
                            order(this.value);
                        });

                        function order(value) {
                            x.domain(orders[value]);

                            var t = matrixGraphSVG.transition().duration(2500);

                            t.selectAll(".row")
                                .delay(function(d, i) { return x(i) * 4; })
                                .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
                                .selectAll(".cell")
                                .delay(function(d) { return x(d.x) * 4; })
                                .attr("x", function(d) { return x(d.x); });

                            t.selectAll(".column")
                                .delay(function(d, i) { return x(i) * 4; })
                                .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
                        }

                        var timeout = setTimeout(function() {
                            order("group");
                            //d3.select("#order").property("selectedIndex", 2).node().focus();
                        }, 5000);
                    }





                iAttrs.$observe('title',function (){

                    ActiveDataFactory.callRelationsData().then(function(data){


                         matrix = [], nodes = data.nodes, nLength = nodes.length;

                        data.nodes.forEach(function(d, i) {
                            d.id = i;
                            d.index = i;
                            d.count = 0;
                            matrix[i] = d3.range(nLength).map(function(j) { return {x: j, y: i, z: 0}; });
                        });

                        // Convert links to matrix; count character occurrences.
                        data.links.forEach(function(link) {
                            matrix[link.source][link.target].z += link.value;
                            matrix[link.target][link.source].z += link.value;
                            matrix[link.source][link.source].z += link.value;
                            matrix[link.target][link.target].z += link.value;
                            nodes[link.source].count += link.value;
                            nodes[link.target].count += link.value;
                        });


                        renderForceGraph(data);

                        renderMatrixGraph();

                    },function (data) {
                        alert(data);
                    });

                    // d3.json('mbar/relation3.json', function(err, data) {
                    //
                    //
                    // });

                });

                var slidvalueChange = function (){
                    //change force
                    force.charge(iElement.find("#range_1")[0].value);
                    force.friction(iElement.find("#range_2")[0].value);
                    force.gravity(iElement.find("#range_3")[0].value);
                    force.linkDistance(iElement.find("#range_4")[0].value);
                    force.start();
                };
                iElement.find("#range_1").on("change",slidvalueChange);
                iElement.find("#range_2").on("change",slidvalueChange);
                iElement.find("#range_3").on("change",slidvalueChange);
                iElement.find("#range_4").on("change",slidvalueChange);


                //add  resizeView  in the end
                var resizeView = function(){
                    var newWidth = iElement.width();
                    if(newWidth<=0 || width == newWidth) return;
                    width = newWidth;
                    height = width * 0.5;
                    svg.attr('width', newWidth-20)
                        .attr('height', height);

                    force.size([width,height]);

                    voronoi.clipExtent([[10, 10], [width-20, height-20]]);

                    force.start();

                    //update Matrix Graph
                    if(renderMatrixGraph)renderMatrixGraph();
                };

                var timer;
                var updateScene = function () {
                    resizeView();
                    timer = setTimeout(updateScene, 1000);
                };
                updateScene();

            }
        }
    }
}]);



stavrDirts.directive('myBarChart', ['$interval', function($interval) {
    return {
        restrict: 'A',
        transclude: false,
        templateUrl: 'template/visualtoolhtml/boxTemplate.html',
        scope: {
            isDataChange: '@'
        },
        controller: function ($scope, $element, $transclude, $http) {
            $scope.isdatachange = false;
            $scope.$on('dataUpdate',function () {
                $scope.isdatachange = !$scope.isdatachange;
                $element[0].innerText = "Change the Box";

            })
        },
        link: {
            pre: function (scope, iElement, iAttrs, controller) {

            },
            post: function (scope, iElement, iAttrs, controller) {

                var boxTitle = iElement[0].children[0].children[0];
                boxTitle.innerText = iElement.attr('my-bar-chart');
                var boxBody = iElement.context.lastChild;
                boxBody.setAttribute('my-data-pan', 'true');
                var w = boxBody.offsetWidth;
                if (w <= 0) return;
                var h = 0.6 * w;

                var padding = {top: 40, right: 40, bottom: 40, left: 40};
                var dataset;
                //Set up stack method
                var stack = d3.layout.stack();

                d3.json("mbar/mperday.json", function (json) {
                        dataset = json;

                        //Data, stacked
                        stack(dataset);
                        var color = d3.scale.category10();
                        var color_hash = {
                            0: ["taxi_20196", color(0)],
                            1: ["taxi_18308", color(1)],
                            2: ["taxi_19701", color(2)]
                        };


                        //Set up scales
                        var xScale = d3.time.scale()
                            .domain([new Date(dataset[0][0].time), d3.time.day.offset(new Date(dataset[0][dataset[0].length - 1].time), 8)])
                            .rangeRound([0, w - padding.left - padding.right]);

                        var yScale = d3.scale.linear()
                            .domain([0,
                                d3.max(dataset, function (d) {
                                    return d3.max(d, function (d) {
                                        return d.y0 + d.y;
                                    });
                                })
                            ])
                            .range([h - padding.bottom - padding.top, 0]);

                        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .ticks(d3.time.days, 1);

                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .ticks(10);


                        //Create SVG element
                        var svg = d3.select(boxBody)
                            .append("svg")
                            .attr("width", w)
                            .attr("height", h);

                        // Add a group for each row of data
                        var groups = svg.selectAll("g")
                            .data(dataset)
                            .enter()
                            .append("g")
                            .attr("class", "rgroups")
                            .attr("transform", "translate(" + padding.left + "," + (h - padding.bottom) + ")")
                            .style("fill", function (d, i) {
                                return color_hash[dataset.indexOf(d)][1];
                            });

                        // Add a rect for each data value
                        var rects = groups.selectAll("rect")
                            .data(function (d) {
                                return d;
                            })
                            .enter()
                            .append("rect")
                            .attr("width", 2)
                            .style("fill-opacity", 1e-6);


                        rects.transition()
                            .duration(function (d, i) {
                                return 500 * i;
                            })
                            .ease("linear")
                            .attr("x", function (d) {
                                return xScale(new Date(d.time));
                            })
                            .attr("y", function (d) {
                                return -(-yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom) * 2);
                            })
                            .attr("height", function (d) {
                                return -yScale(d.y) + (h - padding.top - padding.bottom);
                            })
                            .attr("width", 15)
                            .style("fill-opacity", 1);

                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(40," + (h - padding.bottom) + ")")
                            .call(xAxis);


                        svg.append("g")
                            .attr("class", "y axis")
                            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                            .call(yAxis);

                        // adding legend

                        var legend = svg.append("g")
                            .attr("class", "legend")
                            .attr("x", w - padding.right - 65)
                            .attr("y", 25)
                            .attr("height", 100)
                            .attr("width", 100);

                        legend.selectAll("g").data(dataset)
                            .enter()
                            .append('g')
                            .each(function (d, i) {
                                var g = d3.select(this);
                                g.append("rect")
                                    .attr("x", w - padding.right - 65)
                                    .attr("y", i * 25 + 10)
                                    .attr("width", 10)
                                    .attr("height", 10)
                                    .style("fill", color_hash[String(i)][1]);

                                g.append("text")
                                    .attr("x", w - padding.right - 50)
                                    .attr("y", i * 25 + 20)
                                    .attr("height", 30)
                                    .attr("width", 100)
                                    .style("fill", color_hash[String(i)][1])
                                    .text(color_hash[String(i)][0]);
                            });


                        // y axis text
                        svg.append("text")
                            .attr("transform", "rotate(-90)")
                            .attr("y", 0 - 5)
                            .attr("x", 0 - (h / 2))
                            .attr("dy", "1em")
                            .text("Number of Events");

                        // x axis text
                        svg.append("text")
                            .attr("class", "xtext")
                            .attr("x", w / 2 - padding.left)
                            .attr("y", h - 5)
                            .attr("text-anchor", "middle")
                            .text("Days");

                        // title text
                        svg.append("text")
                            .attr("class", "title")
                            .attr("x", (w / 2))
                            .attr("y", 20)
                            .attr("text-anchor", "middle")
                            .style("font-size", "16px")
                            .style("text-decoration", "underline")
                            .text("Number of Events per day.");

                        //On click, update with new data
                        d3.selectAll(".m")
                            .on("click", function () {
                                var date = this.getAttribute("value");

                                var str;
                                if (date == "2014-02-19") {
                                    str = "mbar/19.json";
                                } else if (date == "2014-02-20") {
                                    str = "mbar/20.json";
                                } else if (date == "2014-02-21") {
                                    str = "mbar/21.json";
                                } else if (date == "2014-02-22") {
                                    str = "mbar/22.json";
                                } else {
                                    str = "mbar/23.json";
                                }

                                d3.json(str, function (json) {

                                    dataset = json;
                                    stack(dataset);

                                    console.log(dataset);

                                    xScale.domain([new Date(0, 0, 0, dataset[0][0].time, 0, 0, 0), new Date(0, 0, 0, dataset[0][dataset[0].length - 1].time, 0, 0, 0)])
                                        .rangeRound([0, w - padding.left - padding.right]);

                                    yScale.domain([0,
                                            d3.max(dataset, function (d) {
                                                return d3.max(d, function (d) {
                                                    return d.y0 + d.y;
                                                });
                                            })
                                        ])
                                        .range([h - padding.bottom - padding.top, 0]);

                                    xAxis.scale(xScale)
                                        .ticks(d3.time.hour, 2)
                                        .tickFormat(d3.time.format("%H"));

                                    yAxis.scale(yScale)
                                        .orient("left")
                                        .ticks(10);

                                    groups = svg.selectAll(".rgroups")
                                        .data(dataset);

                                    groups.enter().append("g")
                                        .attr("class", "rgroups")
                                        .attr("transform", "translate(" + padding.left + "," + (h - padding.bottom) + ")")
                                        .style("fill", function (d, i) {
                                            return color(i);
                                        });


                                    rects = groups.selectAll("rect")
                                        .data(function (d) {
                                            return d;
                                        });

                                    rects.enter()
                                        .append("rect")
                                        .attr("x", w)
                                        .attr("width", 1)
                                        .style("fill-opacity", 1e-6);

                                    rects.transition()
                                        .duration(1000)
                                        .ease("linear")
                                        .attr("x", function (d) {
                                            return xScale(new Date(0, 0, 0, d.time, 0, 0, 0));
                                        })
                                        .attr("y", function (d) {
                                            return -(-yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom) * 2);
                                        })
                                        .attr("height", function (d) {
                                            return -yScale(d.y) + (h - padding.top - padding.bottom);
                                        })
                                        .attr("width", 15)
                                        .style("fill-opacity", 1);

                                    rects.exit()
                                        .transition()
                                        .duration(1000)
                                        .ease("circle")
                                        .attr("x", w)
                                        .remove();

                                    groups.exit()
                                        .transition()
                                        .duration(1000)
                                        .ease("circle")
                                        .attr("x", w)
                                        .remove();


                                    svg.select(".x.axis")
                                        .transition()
                                        .duration(1000)
                                        .ease("circle")
                                        .call(xAxis);

                                    svg.select(".y.axis")
                                        .transition()
                                        .duration(1000)
                                        .ease("circle")
                                        .call(yAxis);

                                    svg.select(".xtext")
                                        .text("Hours");

                                    svg.select(".title")
                                        .text("Number of messages per hour on " + date + ".");
                                });
                            });


                    });


            }

        }
    }
}]);

stavrDirts.directive('myStackBarChart', ['$interval', function($interval) {
    return {
        restrict: 'A',
        transclude: false,
        templateUrl: 'template/visualtoolhtml/stackBarBox.html',
        controller: function ($scope, $element, $transclude, $http) {
            $scope.isdatachange = false;
            $scope.dropBtnName = "Events per day";
            $scope.dateSet = [{value:"2014-02-19"},
                {value:"2014-02-20"},
                {value:"2014-02-21"},
                {value:"2014-02-22"},
                {value:"2014-02-23"}];


            $scope.$on('dataUpdate',function () {
                $scope.isdatachange = !$scope.isdatachange;
                $element[0].innerText = "Change the Box";

            })
        },
        link: {
            pre: function (scope, iElement, iAttrs, controller) {

            },
            post: function (scope, iElement, iAttrs, controller) {

                var boxTitle = iElement[0].children[0].children[0];
                boxTitle.innerText = iElement.attr('my-stack-bar-chart');
                var boxBody = iElement[0].children[1].children[1];
                var w = boxBody.offsetWidth;
                if (w <= 0) return;
                var h = 0.6 * w;

                var padding = {top: 40, right: 40, bottom: 40, left: 40};
                var dataset;
                //Set up stack method
                var stack = d3.layout.stack();

                d3.json("mbar/mperday.json", function (json) {
                    dataset = json;

                    //Data, stacked
                    stack(dataset);
                    var color = d3.scale.category10();
                    var color_hash = {
                        0: ["taxi_20196", color(0)],
                        1: ["taxi_18308", color(1)],
                        2: ["taxi_19701", color(2)]
                    };


                    //Set up scales
                    var xScale = d3.time.scale()
                        .domain([new Date(dataset[0][0].time), d3.time.day.offset(new Date(dataset[0][dataset[0].length - 1].time), 8)])
                        .rangeRound([0, w - padding.left - padding.right]);

                    var yScale = d3.scale.linear()
                        .domain([0,
                            d3.max(dataset, function (d) {
                                return d3.max(d, function (d) {
                                    return d.y0 + d.y;
                                });
                            })
                        ])
                        .range([h - padding.bottom - padding.top, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .ticks(d3.time.days, 1);

                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
                        .ticks(10);


                    //Create SVG element
                    var svg = d3.select(boxBody)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

                    // Add a group for each row of data
                    var groups = svg.selectAll("g")
                        .data(dataset)
                        .enter()
                        .append("g")
                        .attr("class", "rgroups")
                        .attr("transform", "translate(" + padding.left + "," + (h - padding.bottom) + ")")
                        .style("fill", function (d, i) {
                            return color_hash[dataset.indexOf(d)][1];
                        });

                    // Add a rect for each data value
                    var rects = groups.selectAll("rect")
                        .data(function (d) {
                            return d;
                        })
                        .enter()
                        .append("rect")
                        .attr("width", 2)
                        .style("fill-opacity", 1e-6);


                    rects.transition()
                        .duration(function (d, i) {
                            return 500 * i;
                        })
                        .ease("linear")
                        .attr("x", function (d) {
                            return xScale(new Date(d.time));
                        })
                        .attr("y", function (d) {
                            return -(-yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom) * 2);
                        })
                        .attr("height", function (d) {
                            return -yScale(d.y) + (h - padding.top - padding.bottom);
                        })
                        .attr("width", 15)
                        .style("fill-opacity", 1);

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(40," + (h - padding.bottom) + ")")
                        .call(xAxis);


                    svg.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                        .call(yAxis);

                    // adding legend

                    var legend = svg.append("g")
                        .attr("class", "legend")
                        .attr("x", w - padding.right - 65)
                        .attr("y", 25)
                        .attr("height", 100)
                        .attr("width", 100);

                    legend.selectAll("g").data(dataset)
                        .enter()
                        .append('g')
                        .each(function (d, i) {
                            var g = d3.select(this);
                            g.append("rect")
                                .attr("x", w - padding.right - 65)
                                .attr("y", i * 25 + 10)
                                .attr("width", 10)
                                .attr("height", 10)
                                .style("fill", color_hash[String(i)][1]);

                            g.append("text")
                                .attr("x", w - padding.right - 50)
                                .attr("y", i * 25 + 20)
                                .attr("height", 30)
                                .attr("width", 100)
                                .style("fill", color_hash[String(i)][1])
                                .text(color_hash[String(i)][0]);
                        });


                    // y axis text
                    svg.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0 - 5)
                        .attr("x", 0 - (h / 2))
                        .attr("dy", "1em")
                        .text("Number of Events");

                    // x axis text
                    svg.append("text")
                        .attr("class", "xtext")
                        .attr("x", w / 2 - padding.left)
                        .attr("y", h - 5)
                        .attr("text-anchor", "middle")
                        .text("Days");

                    // title text
                    svg.append("text")
                        .attr("class", "title")
                        .attr("x", (w / 2))
                        .attr("y", 20)
                        .attr("text-anchor", "middle")
                        .style("font-size", "16px")
                        .style("text-decoration", "underline")
                        .text("Number of Events per day.");

                    //On click, update with new data
                    d3.selectAll(".m")
                        .on("click", function () {
                            var date = this.getAttribute("value");

                            var str;
                            if (date == "2014-02-19") {
                                str = "mbar/19.json";
                            } else if (date == "2014-02-20") {
                                str = "mbar/20.json";
                            } else if (date == "2014-02-21") {
                                str = "mbar/21.json";
                            } else if (date == "2014-02-22") {
                                str = "mbar/22.json";
                            } else {
                                str = "mbar/23.json";
                            }

                            d3.json(str, function (json) {

                                dataset = json;
                                stack(dataset);

                                console.log(dataset);

                                xScale.domain([new Date(0, 0, 0, dataset[0][0].time, 0, 0, 0), new Date(0, 0, 0, dataset[0][dataset[0].length - 1].time, 0, 0, 0)])
                                    .rangeRound([0, w - padding.left - padding.right]);

                                yScale.domain([0,
                                        d3.max(dataset, function (d) {
                                            return d3.max(d, function (d) {
                                                return d.y0 + d.y;
                                            });
                                        })
                                    ])
                                    .range([h - padding.bottom - padding.top, 0]);

                                xAxis.scale(xScale)
                                    .ticks(d3.time.hour, 2)
                                    .tickFormat(d3.time.format("%H"));

                                yAxis.scale(yScale)
                                    .orient("left")
                                    .ticks(10);

                                groups = svg.selectAll(".rgroups")
                                    .data(dataset);

                                groups.enter().append("g")
                                    .attr("class", "rgroups")
                                    .attr("transform", "translate(" + padding.left + "," + (h - padding.bottom) + ")")
                                    .style("fill", function (d, i) {
                                        return color(i);
                                    });


                                rects = groups.selectAll("rect")
                                    .data(function (d) {
                                        return d;
                                    });

                                rects.enter()
                                    .append("rect")
                                    .attr("x", w)
                                    .attr("width", 1)
                                    .style("fill-opacity", 1e-6);

                                rects.transition()
                                    .duration(1000)
                                    .ease("linear")
                                    .attr("x", function (d) {
                                        return xScale(new Date(0, 0, 0, d.time, 0, 0, 0));
                                    })
                                    .attr("y", function (d) {
                                        return -(-yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom) * 2);
                                    })
                                    .attr("height", function (d) {
                                        return -yScale(d.y) + (h - padding.top - padding.bottom);
                                    })
                                    .attr("width", 15)
                                    .style("fill-opacity", 1);

                                rects.exit()
                                    .transition()
                                    .duration(1000)
                                    .ease("circle")
                                    .attr("x", w)
                                    .remove();

                                groups.exit()
                                    .transition()
                                    .duration(1000)
                                    .ease("circle")
                                    .attr("x", w)
                                    .remove();


                                svg.select(".x.axis")
                                    .transition()
                                    .duration(1000)
                                    .ease("circle")
                                    .call(xAxis);

                                svg.select(".y.axis")
                                    .transition()
                                    .duration(1000)
                                    .ease("circle")
                                    .call(yAxis);

                                svg.select(".xtext")
                                    .text("Hours");

                                svg.select(".title")
                                    .text("Number of messages per hour on " + date + ".");
                            });
                        });


                });


            }

        }
    }
}]);


/**
 *  Table View
 */
stavrDirts.directive('myTrajectoryLayerTable',['MapViewerSever',function (MapViewerSever) {
    return {
        restrict: 'A',
        transclude: false,
        link: {
            pre: function (scope, iElement, iAttrs, controller) {

            },
            post: function (scope, iElement, iAttrs, controller) {
                
            }

        }
    }
}]);

stavrDirts.directive('mySelectedTable',['$rootScope','ActiveDataFactory',function($rootScope,ActiveDataFactory){
    return {
        restrict : 'A',
        transclude: false,
        templateUrl:'template/visualtoolhtml/boxTemplate.html',
        controller: function ($scope,$element,$transclude,$http) {

        },
        link:{
            pre: function (tElement,tAttrs,transclude) {

            },
            post:function (scope,iElement,iAttrs,controller) {

                iAttrs.$observe('title',function () {
                    var boxTitle = iElement[0].children[0].children[0];
                    boxTitle.innerText = iElement.attr('my-selected-table');
                    var boxBody = iElement.context.lastChild;
                    var width = boxBody.offsetWidth;
                    if (width <= 0) return;
                    boxBody.innerHTML = ActiveDataFactory.callSelectedDataTable();
                    var tableElement = boxBody.firstChild;
                    if(tableElement==null) return;

                    scope.selectTableView = $(tableElement).DataTable({
                        "paging": true,
                        "lengthChange": true,
                        "searching": false,
                        "ordering": true,
                        "info": true,
                        "autoWidth": true,
                        "select": true
                    });

                    var tableBodyElement = boxBody.lastChild;
                    $(tableBodyElement).on( 'click', 'tr', function () {
                        var currentTr = this;
                        var trSet = scope.selectTableView.rows('.active').nodes();
                        trSet.each(function (e,i) {
                            if(e!==currentTr)
                            {
                                $(e).toggleClass('active');
                            }
                        });
                        $(this).toggleClass('active');
                    } );

                });


            }
        }
    }
}]);



stavrDirts.directive('myFullCalendar',['$rootScope','ActiveDataFactory',function($rootScope,ActiveDataFactory){
    return {
        restrict : 'A',
        transclude: false,
        controller: function ($scope,$element,$transclude,$http) {

        },
        link:{
            pre: function (tElement,tAttrs,transclude) {

            },
            post:function (scope,iElement,iAttrs,controller) {

                var legendRect = [{color:"#c6dbef",value:"0~500"},
                    {color:"#9ecae1",value:"500~1000"},
                    {color:"#6baed6",value:"1000~1500"},
                    {color:"#4292c6",value:"1500~2000"},
                    {color:"#2171b5",value:"2000~2500"},
                    {color:"#084594",value:"2500~3000"}
                ];
                var legendAQI = [
                    {color:"#a7cf8c",value:"0~50    Excellent"},
                    {color:"#f7da64",value:"51~100  Good"},
                    {color:"#f29e39",value:"101~150 Light Polluted"},
                    {color:"#da555d",value:"151~200 Moderately Polluted"},
                    {color:"#b9377a",value:"201~300 Heavily Polluted"},
                    {color:"#881326",value:">300   Severely Polluted"}
                ];
                iAttrs.$observe('myFullCalendar',function () {
                    /* initialize the calendar
                     -----------------------------------------------------------------*/
                    //Date for the calendar events (dummy data)
                    var start = $.fullCalendar.moment('2013-01-01');
                    var date = new Date("2013-01-01");
                    var d = date.getDate(),
                        m = date.getMonth(),
                        y = date.getFullYear();

                    while(iElement.firstChild){
                        iElement.removeChild(iElement.firstChild);
                    }
                    $(iElement).fullCalendar({
                        header: {
                            left: 'prev,next',
                            center: 'title',
                            right: 'month,basicWeek,agendaDay'
                        },
                        buttonText: {
                            month: 'month',
                            week: 'week',
                            day: 'day'
                        },
                        //Random default events
                        events: [],
                        editable: true,
                        defaultDate:start,
                        eventRender:function(event,element){
                            $(element).append().html("");
                        },
                        eventAfterRender:function(event,element,view){
                            $(element).append().html("");

                            var width = $(element).width() || 120;
                            var height = $(element).height() || 60;
                            var s = d3.select(document.createElement("div")).append("svg")
                                .attr("height",height)
                                .attr("width",width);
                            var svg = s.append("g");
                            var x = d3.scale.ordinal()
                                .rangeRoundBands([0, width], .1);

                            var y = d3.scale.linear()
                                .range([height-10, 0]);

                            var colorIndex = d3.scale.quantize().range([0,1,2,3,4,5]);
                            colorIndex.domain([0,3000]);
                            var colorAQIIndex = d3.scale.threshold().range([0,1,2,3,4,5]);
                            colorAQIIndex.domain([51,101,151,201,301]);


                            // var data =[{a:1,b:10},{a:2,b:20},{a:3,b:30},{a:4,b:15},
                            //     {a:5,b:10},{a:6,b:20},{a:7,b:30},{a:8,b:15},
                            //     {a:9,b:10},{a:10,b:20},{a:11,b:30},{a:12,b:15}];
                            var data = event.data;

                            var xFun = function(d) { return x(d.A); }
                            var yFun = function(d) { return y(d.B); }
                            var widthFun = function(){ return x.rangeBand();}
                            var heightFun = function(d) { return height - y(d.B); }

                            switch(view.intervalUnit){
                                case "month": break;
                                case "week":
                                case "day":
                                    x = d3.scale.ordinal()
                                        .rangeRoundBands([0, height], .1);

                                    y = d3.scale.linear()
                                        .range([width-10, 0]);

                                    heightFun = function(){ return x.rangeBand();}

                                    widthFun = function(d) { return width - y(d.B); }

                                    xFun = function(d) { return 0; }
                                    yFun = function(d) { return x(d.A); }
                            };

                            x.domain(data.map(function(d) { return d.A; }));
                            //y.domain([0, d3.max(data, function(d) { return d.B; })]);
                            y.domain([0, 3000]);

                            var tip = d3.tip()
                                .attr('class', 'd3-tip')
                                .offset([0, 0])
                                .html(function(d) {
                                    return "<span style='color:orangered'>" + d.B + "</span>";
                                });

                            svg.call(tip);
                            svg.selectAll(".bar")
                                .data(data)
                                .enter().append("rect")
                                .attr("class", "bar")
                                .attr("x",xFun)
                                .attr("width",widthFun)
                                .attr("y",yFun)
                                .attr("height",heightFun )
                                .attr("fill",function(d,i){return legendRect[colorIndex(d.B)].color;})
                                .on("mouseover",tip.show)
                                .on("mouseout",tip.hide);



                            $(element).append(s[0]);



                            // update the Head Info

                            var td = $(element).parent();
                            var tr = td.parent();
                            var indexD  = td.index();

                            var tbody = tr.parent();
                            var thead = tbody.siblings();
                            var tr_h  = thead.children();
                            var td_h  = tr_h.children()[indexD];
                            var h_width = $(td_h).width() || 60;
                            var h_height = $(td_h).height() || 30;
                            $(td_h).prepend(event.dataWeather);
                            $(td_h).css("background-color",legendAQI[colorAQIIndex(event.AQI)].color);
                            $(td_h).css("color","white")



                        },
                    });

                    ActiveDataFactory.callFullCalendarEvents().then(function (events) {
                        $(iElement).fullCalendar('addEventSource',events);
                        var counterPassengers = 0;
                        events.forEach(function(e){
                            for(var i=0;i<12;i++){
                                counterPassengers += +e.data[i].B;
                            }
                        });

                        scope.passengersNumber = addCommas(counterPassengers);
                        console.log("passengers: "+ scope.passengersNumber);
                    },function (data) {
                        alert(data);
                    });

                });

                var addCommas = function(nStr)
                {
                    nStr += '';
                    var x = nStr.split('.');
                    var x1 = x[0];
                    var x2 = x.length > 1 ? '.' + x[1] : '';
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
                }

            }
        }
    }
}]);


stavrDirts.directive('myLegendInfo',['ActiveDataFactory',function (ActiveDataFactory) {
    return {
        restrict : 'A',
        transclude: true,
        controller: function ($scope,$element,$transclude,$http) {

        },
        link:{
            pre: function (scope,iElement,iAttrs,controller) {

            },
            post:function (scope,iElement,iAttrs,controller) {
                var legendRect = [{color:"#c6dbef",value:"0~500"},
                    {color:"#9ecae1",value:"501~1000"},
                    {color:"#6baed6",value:"1001~1500"},
                    {color:"#4292c6",value:"1501~2000"},
                    {color:"#2171b5",value:"2001~2500"},
                    {color:"#084594",value:"2501~3000"}
                ];
                var legendAQI = [
                    {color:"#a7cf8c",value:"0~50    Excellent"},
                    {color:"#f7da64",value:"51~100  Good"},
                    {color:"#f29e39",value:"101~150 Light Polluted"},
                    {color:"#da555d",value:"151~200 Moderately Polluted"},
                    {color:"#b9377a",value:"201~300 Heavily Polluted"},
                    {color:"#881326",value:">300   Severely Polluted"}
                ];
                iAttrs.$observe("myLegendInfo",function(){

                    var data = null;
                    var type = iElement.attr('my-legend-info');
                    switch (type){
                        case "AQI":data = legendAQI;break;
                        case "Passengers":data = legendRect;break;
                        default :
                    };

                    var legendBox = {width:30,height:15,topMargin:5,rightMargin:5};

                    //draw legend
                    var quantize = d3.scale.quantile()
                        .domain([100, 20000 ])
                        .range(d3.range(5).map(function(i) { return "q" + i + "-5"; }));
                    d3.select(iElement[0]).selectAll("svg").remove();
                    var svg = d3.select(iElement[0]).append("svg");

                    var svgg = svg.append("g")
                        .attr("transform", "translate(20,20)");

                    var cell = svgg.selectAll(".legendCell")
                        .data(data).enter().append("g")
                        .attr("class","legendCell")
                        .attr("transform",function (d,i) {
                            return "translate(0," + i*(legendBox.height+legendBox.topMargin) + ")";
                        });

                    cell.append("rect")
                        .attr("class", "legendCell")
                        .attr("fill",function(d){return d.color;})
                        .attr("width",legendBox.width)
                        .attr("height",legendBox.height );

                    cell.append("text")
                        .attr("class",".legendCellText")
                        .attr("x",function(d,i){return legendBox.width+legendBox.rightMargin; })
                        .attr("y",legendBox.height/2)
                        .attr("width",legendBox.width)
                        .attr("height",legendBox.height )
                        .text(function (d) {
                            return d.value;
                        });
                });



                
            }
        }
    }
}]);

//lineChart
stavrDirts.directive('myLinesChart',['ActiveDataFactory',function (ActiveDataFactory) {
    return {
        restrict : 'A',
        transclude: true,
        controller: function ($scope,$element,$transclude,$http) {

        },
        link:{
            pre: function (scope,iElement,iAttrs,controller) {

            },
            post:function (scope,iElement,iAttrs,controller) {

                iAttrs.$observe("myLinesChart",function() {

                    var data = null;
                    var type = iElement.attr('my-lines-chart');

                    var margin = {top: 30, right: 50, bottom: 30, left: 30},
                        width = iElement.width() - margin.left - margin.right,
                        height =iElement.height() || iElement.width() - margin.top - margin.bottom;
                    var parseDate = d3.time.format("%Y/%m/%d").parse;

                    var x = d3.time.scale().range([0, width]);
                    var y0 = d3.scale.linear().range([height, 0]);
                    var y1 = d3.scale.linear().range([height, 0]);

                    var xAxis = d3.svg.axis().scale(x)
                        .orient("bottom").ticks(5);

                    var yAxisLeft = d3.svg.axis().scale(y0)
                        .orient("left").ticks(5);

                    var yAxisRight = d3.svg.axis().scale(y1)
                        .orient("right").ticks(5);

                    var valueline = d3.svg.line()
                        .x(function(d) { return x(d.date); })
                        .y(function(d) { return y0(d.AQI); });

                    var valueline2 = d3.svg.line()
                        .x(function(d) { return x(d.date); })
                        .y(function(d) { return y1(d.Passengers); });

                    var svg = d3.select(iElement[0])
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");

                    // Get the data
                    d3.csv("mbar/calendarData/everyday.csv", function(error, data) {
                        data.forEach(function(d) {
                            d.date = parseDate(d.date);
                            d.AQI = +d.AQI;
                            d.Passengers = +d.Passengers;
                        });

                        // Scale the range of the data
                        x.domain(d3.extent(data, function(d) { return d.date; }));
                        y0.domain([0, d3.max(data, function(d) {
                            return Math.max(d.AQI); })]);
                        y1.domain([0, d3.max(data, function(d) {
                            return Math.max(d.Passengers); })]);

                        svg.append("path")        // Add the valueline path.
                            .attr("class","line")
                            .style("stroke", "orange")
                            .attr("d", valueline(data));

                        svg.append("path")        // Add the valueline2 path.
                            .attr("class","line")
                            .attr("d", valueline2(data));

                        svg.append("g")            // Add the X Axis
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis);

                        svg.append("g")
                            .attr("class", "y axis")
                            .style("fill", "orange")
                            .call(yAxisLeft)
                            .append("text")
                            .attr("y", -10)
                            .attr("x", -10)
                            .attr("dy", ".71em")
                            .style("text-anchor", "end")
                            .text("AQI");

                        svg.append("g")
                            .attr("class", "y axis")
                            .attr("transform", "translate(" + width + " ,0)")
                            .style("fill", "steelblue")
                            .call(yAxisRight)
                            .append("text")
                            .attr("y", -10)
                            .attr("x", 10)
                            .attr("dy", ".71em")
                            .style("text-anchor", "end")
                            .text("Passengers");
                    });
                });
            }
        }
    }
}]);


// stavrDirts.directive('mySideLayout',function () {
//     return {
//         restrict : 'A',
//         transclude: true,
//         controller: function ($scope,$element,$transclude,$http) {
//
//         },
//         link:{
//             pre: function (scope,iElement,iAttrs,controller) {
//
//             },
//             post:function (scope,iElement,iAttrs,controller) {
//
//             }
//         }
//     }
// });