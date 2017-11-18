$(function() {
  let param = (new URL(location)).searchParams;   
  if (param == "") {
    $('#pollcreator').html("there doesn't seem to be a record here--sorry!");
  } else {
 var poll_id = param.get('id');
  }
  var optArr=[];
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
      $('h1').html(data.poll_name);       
      $('<div class="bar selectedpoll"></div>').html(data.poll_name).appendTo('#pollspot'); 
      $('<container id="results"></container>').appendTo('.bar');
      getPageOptions(); 
      }); 
    
  }
  
    function getVotedOptions(opsArray){       
    $.get('/voted/', function(votes){  
      
      var $options=$('.option'); 
      //console.log($options);
      /*
      trying something different on this one by assembling an array in the PageOptions function 
      //and passing it in rather than pulling options from the DOM  (accurate rendition of votes==checked: OK)
      //this works==is 6 vs 1/2 dozen... so use the cleaner option--if change need to update other pages.
              var opsArray=[];
              var $options=$('.option'); 
            alert($options);
             console.log($options);
                $options.each(function(index){
                  opsArray.push( index + ": " + $options[index].innerText );
                });  
                 console.log(opsArray);
    */
              votes.forEach(function(vote){
                //console.log(vote.option);
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
 function getPageOptions(){  
 $.get('/polls/select/'+poll_id, function(options){ 
        options.forEach(function(option){            
          var o=option.option+'<span class="hidden option">'+option._id+'</span>';    
          $('<div class="barSub"></div>').html(o).appendTo("#results");
          optArr.push(option._id);
        }); 
   
   $.get('/authroute', function(user){
       if (user._id) {          
         console.log(optArr);
         getVotedOptions(optArr);         
       }
       })
   //click to vote         
          $('div.barSub').click(function(){
            $(this).addClass('selectedOption');            
            var opt_id=$(this).find('.hidden').text();             
            $.post('https://desert-enemy.glitch.me/polls/vote/'+poll_id+'/'+opt_id, function(ret){                
              if (ret=="userVoted"){
                window.location.href=('/errorpage');
              } else {
                window.location.reload();
              }
              
            })
                          
          })
      }); 
  }
 

 //call the display function---display function will call the page options which will call the votedOptions
  //if these don't get called/load in the right order certain dom elements aren't there for things to be added to the display
getDisplay(poll_id);

})