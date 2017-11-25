//global chart var to help with weird chart hover problem
var chart; 

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
             responsive: true,
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
                        //stepSize: 1
                        //this puts marker line on y axis for each whole number
                      }
                  }]
              }
          }
        });
        
      });      
  }

function getPie(){
  
    $.get('/display/userpie', function(data){
      
        //important! destroy old chart or get weird hover behavior
      //!Chart is defined elsewhere, don't worry about it
        //also important: have to set options to begin at zero or chart begins with lowest value in data array
        if (chart) chart.destroy();  
        var ctx = document.getElementById('myChart').getContext('2d');
      
      chart = new Chart(ctx,{
    type: 'pie',
    data: { labels:data.labels,
            datasets: [{
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
      responsive: true,
      title: {
            display: true,
            text: "User Created Polls by Total Votes"
        }
    }
});
    })
}
      