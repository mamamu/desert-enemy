
$(function() {
  //global chart var to help with weird chart hover problem
  var chart;   
  refreshPolls();  



function refreshPolls() {
   $('#pollspot').empty();
  //call the route to get the list of polls and then display
   $.get('/polls', function(polls) { 
    polls.forEach(function(poll) {
      var p=poll.poll_name+'<span class="hidden">'+poll._id+'</span>';      
      $('<div class="bar"></div>').html(p).appendTo('#pollspot');  
    });
     //when you click one of the listed polls process old info on the page, then get the poll id, call the route with it and display a list of options
    $('.bar').click(function(){
      $('.selectedPoll').removeClass('selectedPoll');
      $('#results').remove();
      $('#myChart').empty();      
      $(this).addClass('selectedPoll');
      $('<container id="results"></container>').appendTo(this);
      var id=$(this).find('.hidden').text();      
      $.get('/polls/select/'+id, function(opts){                
        opts.forEach(function(opt){          
          var o=opt.option+'<span class="hidden option">'+opt._id+'</span>';
          $('<div class="barSub" ></div>').html(o).appendTo('#results');
        }); 
        //check for an authorized user (will not return with an ip user), if we have one, include the ability to add additional poll option
        $.get('/authroute', function(user){          
          //$('#temp').empty();
          if (user._id){ 
            $('<div id="temp2"></div>').html("").appendTo("#results");
            $('<form id="additonalOption" class="addOpt"></form>').html('<label>Click above to vote or type a new option</label><span><input id="addOpt"></input><button id="submit" type="submit">Submit</button></span>').appendTo('#temp2')
            $( "#addOpt" ).focus();
            
            //submit just reuses the create option route from the create page
            $('#submit').click(function(){
              var input=$('#addOpt').val();
              $.post('/create/id/' + id +"/"+input, function(){                
              })                
            })
          }         
        })
        
        
                  
        
      $.get('/polls/display/'+id, function(data){
        //important! destroy old chart or get weird hover behavior
        //!chart is defined elsewhere--don't worry about it
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
                //at some point fix the incoming labels instead https://stackoverflow.com/questions/21409717/chart-js-and-long-labels
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
      //click to vote   
          $('div.barSub').click(function(){
            $(this).addClass('selectedOption');            
            var opt_id=$(this).find('.hidden').text(); 
            $.post('polls/vote/'+opt_id);            
          })

          
      //polls/select/id ends here 
      });
    //end div click funtion  
    })
  });  
}

});