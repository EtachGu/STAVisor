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

stavrDirts.directive('myMapChart', ['$interval','MapViewerSever','ActiveDataFactory', function($interval,MapViewerSever,ActiveDataFactory) {
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
                        MapViewerSever.removeAllLayers();

                        var trajectoryFeatures = MapViewerSever.trajectoryFeatures;

                        var selectData = ActiveDataFactory.getSelectData();
                        var typeFeature = "LineString";
                        var d3Color = d3.scale.category10();
                        var featureSet = [];

                        for(var i=0;i<selectData.length;i++){

                            var carNumber = selectData[i][0];
                            //var url = ActiveDataFactory.getTrajUrlByCarNumber(carNumber,typeFeature);
                            var colorLine = d3Color(i);


                            var feature = new ol.Feature({
                                style:   new ol.style.Style({
                                    stroke: new ol.style.Stroke({
                                        color: '#ffcc00',
                                        width: 2
                                    }),
                                    fill: new ol.style.Fill({
                                        color: colorLine
                                    }),
                                    image: new ol.style.Circle({
                                        radius: 7,
                                        fill: new ol.style.Fill({
                                            color: colorLine
                                        })
                                    })
                                })
                            });

                            feature.set('name',carNumber);
                            feature.set('color',colorLine);
                            feature.set('type',typeFeature);
                            feature.set('date',"2013-3-28");

                            trajectoryFeatures.push(feature);

                            // feature
                            ActiveDataFactory.callTrajectoryData(carNumber,typeFeature)
                                .then(function (data) {
                                    var trajectoryCoords =data.geometry.coordinates;
                                    var transformFn = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');
                                    trajectoryCoords.forEach(function (coord) {
                                        var c = transformFn(coord, undefined, coord.length);
                                        coord[0] = c[0];
                                        coord[1] = c[1];
                                    });
                                    var features = MapViewerSever.trajectoryFeatures.getArray();
                                    var featureCurrent = features.filter(function(f){ return f.get('name')==carNumber});
                                    var geoM  = new ol.geom.LineString(trajectoryCoords);
                                    featureCurrent[0].setGeometry(new ol.geom.LineString(trajectoryCoords));

                                },function (data) {
                                    alert(data);
                                });
                            // trajectoryLayer.setStyle =  new ol.style.Style({
                            //     stroke: new ol.style.Stroke({
                            //                         color: '#ffcc00',
                            //                         width: 2
                            //                     }),
                            //     fill: new ol.style.Fill({
                            //         color: '#ffcc00'
                            //     })
                            // });

                          //  map.addLayer(trajectoryLayer);
                        }
                        ActiveDataFactory.isMapUpdate =false;






                    }
                });
                
            }
        }
    }
}]);

stavrDirts.directive('myLineChart', ['$interval','ActiveDataFactory', function($interval,ActiveDataFactory) {
    return {
        restrict : 'A',
        transclude: false,
        templateUrl:'template/visualtoolhtml/boxTemplate.html',
        controller: function ($scope,$element,$transclude,$http) {

            var selectedData = ActiveDataFactory.getSelectData();
            var dateRange = ActiveDataFactory.getDateRange();

        },
        link:{
                pre: function (tElement,tAttrs,transclude) {

                },
                post:function (scope,iElement,iAttrs,controller) {

                    iAttrs.$observe('title',function () {

                        var month = 30 * 24 * 60 * 60 * 1000;
                        var hours = 60 * 60 * 1000;
                        var endTime = 0;
                        var startTime = Date.now();

                        var EventData = [];


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


                                // bind data with DOM
                                var element = d3.select(boxBody).datum(data);

                                // draw the chart
                                eventDropsChart(element);
                            }
                        }

                        ActiveDataFactory.callEventData().then(function (data) {
                            var dataObj = JSON.parse(data);
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
                                }
                                EventData.push(event);
                            }

                            renderTimeGraph(EventData);


                        }, function (data) {
                            alert(data);
                        });
                    });
                   
                }
            }
        }
}]);

stavrDirts.directive('myGraphChart', ['$interval', function($interval) {
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
                function name(d) { return d.name; }
                function group(d) { return d.group; }

                //var color = d3.scale.category10();
                var color = function(i){
                    if(i==1) return '#1f77b4';
                    else return '#ff7f0e';
                };
                function colorByGroup(d) { return color(group(d)); }

                var boxTitle = iElement[0].children[0].children[0];
                boxTitle.innerText = iElement.attr('my-graph-chart');
                var boxBody = iElement.context.lastChild;
                var width = boxBody.offsetWidth;
                if(width<=0) return;
                var height = width * 0.5;

                var svg = d3.select(boxBody)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

                var node, link,nodes_labels;

                var voronoi = d3.geom.voronoi()
                    .x(function(d) { return d.x; })
                    .y(function(d) { return d.y; })
                    .clipExtent([[-10, -10], [width+10, height+10]]);

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

                var force = d3.layout.force()
                    .charge(-2000)
                    .friction(0.3)
                    .linkDistance(20)
                    .size([width,height]);

                force.on('tick', function() {
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
                    clip.exit().remove()

                    clip.selectAll('path').remove();
                    clip.append('path')
                        .attr('d', function(d) { return 'M'+d.join(',')+'Z'; });
                });

                d3.json('mbar/relation.json', function(err, data) {

                    data.nodes.forEach(function(d, i) {
                        d.id = i;
                    });

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
                        .attr('r', 20)
                        .attr('fill', colorByGroup)
                        .attr('fill-opacity', 0.5);

                    node.append('circle')
                        .attr('r', 4)
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
                        });

                    force
                        .nodes( data.nodes )
                        .links( data.links )
                        .start();
                });
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

                    scope.selectTableView = $(tableElement).DataTable({
                        "paging": true,
                        "lengthChange": true,
                        "searching": true,
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