
$(function() {
  $.getScript( 'listdisplay.js', function() {
  let param = (new URL(location)).searchParams;   
  if (param == "") {
    $('#pollcreator').html("there doesn't seem to be a record here--sorry!");
  } else {
 var poll_id = param.get('id');
  }
  var optArr=[];
  var created_by;
  var chart;
  
 //see the note where this function is called to understand why this appears to be duplicated here (it's not).
  function getDisplay(pollid){
    $.get('/polls/display/'+pollid, function(data){
        //important! destroy old chart or get weird hover behavior
      //!Chart is defined elsewhere, don't worry about it
        //also important: have to set options to begin at zero or chart begins with lowest value in data array
        if (chart) chart.destroy();  
        var ctx = document.getElementById('myChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: { labels:data.labels,
            datasets: [{label: data.poll_name,
              backgroundColor:['rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)'],
                   data: data.votes,
                  }]
            },
           options: {
              scales: {
                //xaxis ticks rotated because some labels are long and throwing off the display
                //at some point could fix the incoming labels to line break https://stackoverflow.com/questions/21409717/chart-js-and-long-labels
                xAxes: [{
                  ticks: {
                    minRotation:75,
                    maxRotation:90
                  }
                }],
                  yAxes: [{
                      ticks: {
                          beginAtZero:true,
                        maxTicksLimit: Math.min(11, 1 + Math.max.apply(null, data)),
                        stepSize: 1
                        //this puts marker line on y axis for each whole number
                      }
                  }]
              }
          }
        });
      $('h1').html(data.poll_name);       
      $('<div class="bar selectedpoll"></div>').html(data.poll_name).appendTo('#pollspot'); 
      $('<container id="results"></container>').appendTo('.bar');
       
        getPageOptions(pollid);  
      });
  }
  //display/chart function for this page is a slight variation and can't be substituted with the general one 
    //due to some alternate options and some fiddly bits on how the dom is assembled on this page vs others.
 //call the display function---display function will call the page options which will call the votedOptions
  //if these don't get called/load in the right order certain dom elements aren't there for things to be added to the display
  getDisplay(poll_id);
    
  })
})
  