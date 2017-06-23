var glbFileContents = null;
var glbFileName = null;
var glbFileSizeKB = null;
var glbMaxFileSizeKB = 10000;

$(document).ready(function() {
    // Enable popovers
    $('[data-toggle="popover"]').popover(); 

    // Event handler for file input
	$('#file-input').change('change', readSingleFile);

    // Add click handler to toggle chevron up/down arrow on panel headings
	$('.panel-heading').click(function(e) {
        var _self = $(this);
        var panelIcon = _self.find('.panel-toggle-icon');       

        if(panelIcon.hasClass('panel-collapse')) {
            panelIcon.removeClass('panel-collapse');
            panelIcon.addClass('in');
            
            // Scroll to panel when clicked
            $('html, body').animate({
                scrollTop: $(_self).offset().top
            }, 700);
        } else {
            panelIcon.addClass('panel-collapse');
            panelIcon.removeClass('in');
        }
    });

    // Populate data content for SHA Popover
    var shaDataContentVal = 'Toggle this prior to encrypting or decrypting. ' + 
    'When transferring encrypted content between two or more parties,' + 
    'you can send along the SHA-256 HASH to the recipient(s)' +
    'so they can validate the content came from you and not another source.' + 
    ' NOTE: For larger content, this could take some time...';

    $('.sha-info').attr('data-content', shaDataContentVal);
});

function decryptFile() {
    processFile(0);
}

function decryptText() {
    processText(0);
}

function processFile(processType) {
    var displaySHA = $('#display-file-sha').prop('checked');
    var fileContents = glbFileContents;
    var fullCrypto = new FullCrypto();
    var fullCryptoFunc = null;    
    var pwd = $('#pwd').val();
    var shaOutputElement = $('#file-sha');
    var outputFileName = '';

    // Escape if no file content
    if(fileContents == null || fileContents.length == 0) {
        return;
    }

    if(processType == 1) {        
        // Encrypt
        outputFileName = 'encrypted-' + glbFileName;        
        fullCryptoFunc = fullCrypto.encrypt;
    } else {
        // Decrypt
        outputFileName = 'decrypted-' + glbFileName;
        fullCryptoFunc = fullCrypto.decrypt;
    }

    $('.loader').fadeIn('fast', function() {
        try {
            // Process corresponding crypto function (encrypt/decrypt)
            var cryptoOutput = fullCryptoFunc(fileContents, pwd);            

            // Calculate SHA if desired, use decrypted text
            if(displaySHA) {
                var decryptedText = processType == 1 ? cryptoOutput : fileContents;
                shaOutputElement.val(fullCrypto.getSHA256(decryptedText));
            }

            // Set File Download panel
            setFileDownload('#file-download', cryptoOutput, outputFileName);
            $('#panel-file-download').fadeIn('slow');
            
            // Set File Content panel based on file size
            if(glbFileSizeKB < 50) {
                $('#file-content').text(cryptoOutput);                
                $('#panel-file-content .panel-heading').attr('data-target', '#panel-file-content-body');
                $('#panel-file-content .panel-toggle-icon').show();
            } else {
                $('#panel-file-content .panel-heading').attr('data-target', '');
                $('#panel-file-content .panel-toggle-icon').hide();                
                $('#panel-file-content-body').removeClass('in');
            }

            $('#panel-file-content').fadeIn('slow');
        } catch(err) {
            displayError(err);
        } finally {
            $('.loader').fadeOut('fast');
        }
    });
}

function processText(processType) {
    var displaySHA = $('#display-text-sha').prop('checked');
    var fullCrypto = new FullCrypto();
    var fullCryptoFunc = null;
    var outputElement = null;
    var pwd = $('#pwd').val();
    var shaOutputElement = $('#plain-text-sha');
    var tabElement = null;
    var text = '';

    if(processType == 1) {        
        // Encrypt            
        text = $('#decrypted-text').val();        
        outputElement = $('#encrypted-text');
        tabElement = $('#decrypt-tab-btn');
        fullCryptoFunc = fullCrypto.encrypt;
    } else {
        // Decrypt
        text = $('#encrypted-text').val();
        outputElement = $('#decrypted-text');
        tabElement = $('#encrypt-tab-btn');
        fullCryptoFunc = fullCrypto.decrypt;    
    }
        
    $('.loader').fadeIn('fast', function() {
        try {
            // Process corresponding crypto function (encrypt/decrypt)
            var cryptoOutput = fullCryptoFunc(text, pwd);
            outputElement.val(cryptoOutput);

            // Calculate SHA if desired, use decrypted text
            if(displaySHA) {
                var decryptedText = $('#decrypted-text').val();                
                shaOutputElement.val(fullCrypto.getSHA256(decryptedText));	
            }
            
            // Click opposite tab
            tabElement.click();            
        } catch(err) {
            displayError(err);
        } finally {
            $('.loader').fadeOut('fast');
        }
    });
}

function displayError(err) {
	$('#alert-modal-text').text('Invalid input: ' + err.message);
	$('#alert-modal').modal('show');
	
	console.log(err);
}

function encryptFile() {
    processFile(1);
}

function encryptText() {
    processText(1);
}

function getObjectURL(content) {
	var objectURL = window.URL.createObjectURL(new Blob([content], {
		type: "text/plain;charset=utf-8;"
	}));	
	
	return objectURL;
}

function readSingleFile(e) {
  var file = e.target.files[0];
  
  if (!file) {
    // Close existing panels, reset file size
    $('#panel-file-content').fadeOut('slow');
	$('#panel-file-download').fadeOut('slow');
    $('#file-size').text('');

    return;
  }

  var reader = new FileReader();

  reader.onload = function(e) {
    var contents = e.target.result;
	glbFileContents = contents;
	glbFileName = file.name;
    glbFileSizeKB = parseFloat((file.size / 1000)).toFixed(2);

    // Update file-size and restrict
    $('#file-size').text('File Size (KB): ' + glbFileSizeKB);
    if(glbFileSizeKB > glbMaxFileSizeKB) {
        glbFileContents = null;
        displayError({message: 'The file size ' + glbFileSizeKB + 'KB exceeds allowable ' + glbMaxFileSizeKB + 'KB file size.'});
    }

    // Close existing panels
    $('#panel-file-content').fadeOut('slow');
	$('#panel-file-download').fadeOut('slow');
  };

  $('.loader').fadeIn('fast');
  reader.readAsText(file);
  $('.loader').fadeOut('fast');	
}

function setFileDownload(elementId, content, fileName) {
	var objectURL = getObjectURL(content);		
	$(elementId).attr('href', objectURL);
	$(elementId).attr('download', fileName);	
}

function showAsHtml() {
	var decryptedText = $('#decrypted-text').val();		
	
	// Shrink height if no data to show
	if(decryptedText) {
		$('#html-content').height('600');
		$('#html-content').html(decryptedText);
		$('#html-content').contents().find('html').html(decryptedText);
	} else {
		$('#html-content').height('0');
	}
}

function showPassword() {
	var showPwd = $('#show-pwd').prop('checked');

	if(showPwd) {
		$('#pwd').prop('type', 'text');
	} else {
		$('#pwd').prop('type', 'password');
	}
}