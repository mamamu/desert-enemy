
$(function() {
  
  //wrap the page in listdisplay to acquire the display functions for use 
$.getScript( 'listdisplay.js', function() { 
  $.getScript( 'chartdisplay.js', function() { 
    $('canvas').removeClass('fixed');
        getPie();  
      }) 
  //share var created over in listdispaly, ignore
  share=false;
  $.get('/authroute', function(user){
     
  $.get('/created/', function(items){          
      items.forEach(function(item){        
         var p=item.poll_name+'<span class="hidden">'+item._id+'</span>';         
      $('<div class="bar"></div>').html(p).appendTo('#pollsCreated');  
      })
         $('.bar').click(function(){
           $('canvas').addClass('fixed');
           $('.sharedelete').remove();
      $('.selectedPoll').removeClass('unclickable');    
      $('.selectedPoll').removeClass('selectedPoll');
           
      $('#results').remove();
      $(this).addClass('selectedPoll');
      $('.selectedPoll').addClass('unclickable');
      $('<container id="results"></container>').appendTo(this);
      var id=$(this).find('.hidden').text(); 
       getPageOptions(id);    
       $.getScript( 'chartdisplay.js', function() {  
        getDisplay(id);  
      })
         
      
      $('<div id="shareFormSpot"><span class="right sharedelete"><a href="#" id="share">Share</a><a href="#" id="delete">Delete</a></span></div>').prependTo('#pollscreated .selectedPoll')
        
        //add clickable to child link elements to override selected poll behavior for the links
        $('#delete, #share').addClass('clickable');        
        $('#delete').on('click', function(){          
          $.get('/delete/'+id, function(ret){            
            if (ret=="OK"){
                window.location.href=('/profile');
              } else {
                window.location.href=('/error?msg=4');
              }
          });
        });
        $('#share').on('click', function(){ 
          share=true;
          $('#shareFormSpot').html('<form><label>enter your email</label><input id="sender"></input><label>enter recipients email</label><input id="send_to"></input><button id="email">Email Now</button></form>')
          $('.selectedPoll').addClass('unclickable');
          $('#sender').focus();
          $('#sender, #send_to, #email').removeClass('selectedPoll')
          $('#sender, #send_to, #email').addClass('clickable'); 
          $('#email').click(function(event){
      
            event.preventDefault();
            var sender_address = $('#sender').val();
            var recipient_address = $('#send_to').val();  
            $.post('/share/'+id +'?'+ $.param({sender: sender_address, recipient: recipient_address}), function(ret){            
              if (ret=="OK"){
                  alert("Nodemailer Set up and ready to plug in to a SMTP server.  Site will now redirect you to the detail page whose url would be set as a link to your recipient")
                  window.location.href=('/detail?id='+id);
                } else {
                  window.location.href=('/error?msg=2')
                }
            });
          });    
        });
           //share click function ends here
        
      });         
          
    });
    //end of get/created
  });
  //end of auth 
    
     
   //click not working to open 
   $.get('/voted/', function(votes){        
      votes.forEach(function(vote){          
        var q=vote.poll.poll_name+'<span class="hidden">'+vote.poll._id+'</span>'; 
        $('<div class="bar vot"></div>').html(q).appendTo('#pollsVoted');  
      })
    });
    //end of get voted
  
   })
  //end of the external script
     
   
    })


