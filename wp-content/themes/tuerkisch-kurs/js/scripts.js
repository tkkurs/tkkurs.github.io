var $ = jQuery;
$(document).ready(function(){
	$('#wp-submit').val('Anmelden');
	
	// transform "more" links
	/*
	$("#course-view .descr").each(function(){
		var wrap = $(this),
			content = wrap.html(),
			maxLength = 90;
		if (content.length > maxLength){
			var link = $("<a href='javascript:void(0);' class='content-slider' data-state='more'>mehr &raquo;</a>");
			link.on("click", function(){
				if ($(this).attr("data-state") == "more"){
					$(this).html("&laquo; weniger");
					$(this).attr("data-state", "less");
					$(".content-wrap", wrap).css("height", "auto");
				}else{
					$(this).html("mehr &raquo;");
					$(this).attr("data-state", "more");
					$(".content-wrap", wrap).css("height", "60px");
				}
			});
			link.appendTo($(this));
		}
	});
	*/
	
	// registration
	var rf = $("#registerform");
	if (rf.length > 0){
		var user_login = $("input#user_login", rf);
	    user_login.closest("p").hide();	
	    rf.on("submit", function(){
	    	user_login.val($("input#user_email", rf).val());
	    });
	    // remove username validation error as it is redundant
	    var login_error = $("#login_error");
	    if (login_error.length > 0){
	    	var contents = login_error.html(),
	    		messages = contents.split("<br>");
	    	for(var i=0; i<messages.length; i++){
	    		if (messages[i].indexOf("Benutzername") !== -1){
	    			contents = contents.replace(messages[i] + "<br>", "");
	    		}
	    	}
	    	login_error.html(contents);
	    }
	}
	
	// contact form
    var textarea = $("form span.your-message textarea");
    // we got a contact form
    if (textarea.length > 0){
        var $_GET = {};
  
        document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
            function decode(s) {
                return decodeURIComponent(s.split("+").join(" "));
            }
  
            $_GET[decode(arguments[1])] = decode(arguments[2]);
        });
        var subject = $("form span.your-subject input");
        if ($_GET["courseName"] !== undefined){
        	subject.val("Frage zum Kurs");
      	    textarea.html("Hallo, ich habe eine Frage zum Kurs \"" + $_GET["courseName"] + "\":");
        }else{
        	subject.val("");
        }
    }
    
    /* course table accordion */
    $( "#course-view .desktop-only" ).accordion({ heightStyle: "content", icons: { "header": "ui-arrow-right", "activeHeader": "ui-arrow-down" } });
    $( "#course-view .mobile-only" ).accordion({ heightStyle: "content", icons: { "header": "ui-arrow-right", "activeHeader": "ui-arrow-down" } });
    
	// resize
	$(window).on("resize", function(){
		// refresh accordion sizes on window resize in order to avoid broken layout
		$( "#course-view .desktop-only" ).accordion("refresh");
		$( "#course-view .mobile-only" ).accordion("refresh");
		// console.log("resize: " + $(window).width() + "x" + $(window).height());
	});
	
	$("#left-block .sp-main-div").on("click", "input[type='submit']", function(){
		var mainDiv = $(this).parents('.sp-main-div');
		if (mainDiv.length > 0 && mainDiv.children('.is_ajax_authentication').length==1){
			var hidden = mainDiv.children('.is_ajax_authentication');
			if (hidden.attr('value')=='0'){
				return true;
			}
		}
		
		var login_header = mainDiv.children('.sp-login-header');
		
		//ssl check
		var force_ssl_login = mainDiv.find(".force_ssl_login");
		if (force_ssl_login.length>0 && force_ssl_login.val()=='true' && document.location.protocol!='https:' ){
			login_header.children(".sp-ssl-requires-msg").slideDown(100);
			return false;
		}
		
		var loadingDiv = mainDiv.children(".sp-loading-img");
		loadingDiv.show();
		mainDiv.children("div:not('.sp-loading-img')").css('opacity', '0.4');
		var form = $(this).parents("form");

		login_header.hide();
		login_header.empty();
		
		var inputs = form.find('input');
		if (inputs.length > 0){
			var jsonObj = { };
			var redirect_exec = false;
			inputs.each(function(index){
				var name = $(this).attr('name');
				jsonObj[name] = $(this).val();
				
			});
			$.post(ajax_object.ajax_url, jsonObj, function(data) {
				
				//nonce check
				if (data=='-1'){
					login_header.html("<div id='login_error'>Security test failed.</div>");
					return;
				}
				
				var JSon;
				
				try{
					JSon = $.parseJSON(data);
				}catch(e){
					login_header.html("<div id='login_error'>An unknown error occurred while trying to connect to server.<br>Please refresh the page and try again.</div>");
					return;
				}
				
				
				if (data=='0' || JSon.operation == 'redirect'){
					redirect_exec = true;
					//location.href = JSon.redirect_to;
					location.reload(true);
					
				}else{
					login_header.html(JSon.message);
				}
				
				
			}).always(function(){
				if (!redirect_exec){
					loadingDiv.hide();
					login_header.slideDown(100);
					mainDiv.children("div:not('.sp-loading-img')").css('opacity', '1');
				}
			});
			
		}
		return false;
		
	});
});