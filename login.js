
    $('#login-form-link').click(function(e) {
		$("#login-form").delay(100).fadeIn(100);
 		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
	$('#register-form-link').click(function(e) {
		$("#register-form").delay(100).fadeIn(100);
 		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});

    $('#login-submit').click(function(e) {
		var user = $("#username").val();
                var pass = $("#password").val();
	      if (user == "admin" && pass =="admin"){
	      $.session.set("admin",true);
		 window.location.replace(hostname +"admin.html");
	      }
		e.preventDefault();
	});
