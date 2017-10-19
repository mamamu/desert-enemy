
$(function() {
  //global chart var to help with weird chart hover problem
  var chart;   
  refreshPolls();  



function refreshPolls() {
   $('#pollspot').empty();
   $.get('/polls', function(polls) {  
     
    polls.forEach(function(poll) { 
      
      
      var dm=poll.poll_name+'<span class="hidden">'+poll._id+'</span>';      
      $('<div class="bar"></div>').html(dm).appendTo('#pollspot');  
    });
    $('div').click(function(){
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
        $.get('/authroute', function(user){
          if (user){
            $('<button id="add"></button>').html("+").appendTo('#results')
          }
          $('button').click(function(){     
            //pollid here           
            alert(id)
            //add an input here on page, or do an edit view?
            //$.post('/create/id/' + id +"/"+option, function(){
          })
        })
                  
        
      $.get('/polls/display/'+id, function(data){
        //important! destroy old chart or get weird hover behavior
        if (chart) chart.destroy();
        var ctx = document.getElementById('myChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: { labels:data.labels,
            datasets: [{label: data.poll_name,
              backgroundColor:['rgb(252, 155, 168)', 'rgb(152, 255, 168)','rgb(152, 155, 268)'],
                   data: data.votes,
                  }]
            }
        });
      });        
      //click to vote   
          $('div.barSub').click(function(){
            $(this).addClass('selectedOption');            
            var opt_id=$(this).find('.hidden').text();            
            $.post('polls/vote/'+opt_id)
          })

          
      //polls/select/id ends here 
      });
    //end div click funtion  
    })
  });  
}

});