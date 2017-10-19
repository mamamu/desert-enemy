$(function() {  
  var pollname;
  
  $('#pollname').submit(function(event) {    
    event.preventDefault();
    pollname = $('#name').val();    
    $('h2').text(pollname);
    $('#pollname').toggleClass('hidden');
    $('#options').toggleClass('hidden');
    $.post('/create/new/' + pollname); 
    
 
     });
    
    //$.post('/' + $.param({dream: dream}), function() {
      //$('<li></li>').text(dream).appendTo('ul#dreams');
      //$('input').val('');
      //$('input').focus();
    //});

     $('#options').submit(function(event) {
       //alert(pollname);
        event.preventDefault();
      /*
       var options= $(".option").map(function() {
           return $(this).val();
          }).get();
      alert(options)
           $.post('/create/name/' + $.param({pollname: pollname},{options:options}), function() {
      
      $('input').val('');
      $('#name').focus();
    });
    */
      $(".option").each(function() {
        var option=$(this).val();
        //alert(option);
        $.post('/create/name/' + pollname +"/"+option, function(){
          
          
    //alert($(this).val());
    
       }); 
    });
       $('h2').empty();
     $('input').val('');
     $('#pollname').toggleClass('hidden');
    $('#options').toggleClass('hidden');
    $('#name').focus();
    });
    
 

       /*
      var options= $(".option").map(function() {
          var option=$(this).val();
          alert(option);
           return $(this).val();
          }).get();
      alert(options)
      */
   
  
  

});
