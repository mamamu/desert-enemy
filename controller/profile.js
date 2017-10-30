
$(function() {
  
  var created_by;
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
  
  function getVotedOptions(){       
    $.get('/voted/', function(votes){
      
              var opsArray=[];
              var $options=$('.option'); 
             console.log($options);
                $options.each(function(index){
                  opsArray.push( index + ": " + $options[index].innerText );
                });  
                 console.log(opsArray);
      
              votes.forEach(function(vote){                
                var votedOption=vote.option;
                for (var u=0; u<opsArray.length; u++){
                  if (opsArray[u].indexOf(votedOption)!=-1){ 
                    $options.each(function(index){
                      if (index==u){                        
                        if (($(this).parent().text()).indexOf('you voted for...')==-1){
                          $(this).parent().prepend("you voted for... ");
                        }                                           
                        $(this).parent().addClass('userVote');
                        $('.selectedPoll').addClass('unclickable');
                      }
                    })
                  }                  
                }
              })
            })
  }
  
  $.get('/authroute', function(user){
     
  $.get('/created/', function(items){          
      items.forEach(function(item){        
         var p=item.poll_name+'<span class="hidden">'+item._id+'</span>';         
      $('<div class="bar"></div>').html(p).appendTo('#pollsCreated');  
      })
         $('.bar').click(function(){
      $('.selectedPoll').removeClass('selectedPoll');
      $('#results').remove();
      $(this).addClass('selectedPoll unclickable');
      $('<container id="results"></container>').appendTo(this);
      var id=$(this).find('.hidden').text(); 
      getDisplay(id);
      $.get('/polls/select/'+id, function(opts){                
        opts.forEach(function(opt){          
          var o=opt.option+'<span class="hidden option">'+opt._id+'</span>';
          $('<div class="barSub" ></div>').html(o).appendTo('#results');
        }); 
       getVotedOptions();  
      });         
          
    });
 
    
    })
    
    
   $.get('/voted/', function(votes){        
      votes.forEach(function(vote){         
        var q=vote.pollname+'<span class="hidden">'+vote.poll_id+'</span>'; 
        $('<div class="bar vot"></div>').html(q).appendTo('#pollsVoted');  
      })

    
         $('.vot').click(function(){
      $('.selectedPoll').removeClass('selectedPoll');
      $('#results').remove();
      $(this).addClass('selectedPoll');
      $('<container id="results"></container>').appendTo(this);
      var poll_id=$(this).find('.hidden').text(); 
      getDisplay(poll_id);
      $.get('/polls/select/'+poll_id, function(options){                
        options.forEach(function(option){          
          var o=option.option+'<span class="hidden option">'+option._id+'</span>';
          $('<div class="barSub" ></div>').html(o).appendTo('#results');
        }); 
      }); 
      getVotedOptions();
    });
   })
    //end /voted/
     
   
    })
     

})

