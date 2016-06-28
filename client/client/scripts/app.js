// YOUR CODE HERE:

var app = {
  server: 'https://api.parse.com/1/classes/messages',
  myUser: undefined,
  users: {},
  chatrooms: {lobby: true},
  tabbedrooms: {lobby: true},
  currentChatRoom: 'lobby',
  init() {},
  send(message) {
    /*var message = {
      username: 'shawndrost',
      text: 'trololo',
      roomname: '4chan'
    };*/
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },

  fetch(first) {
    $.ajax({
      url: this.server,
      type: 'GET',
      data: {
        where: {'roomname': app.currentChatRoom === 'lobby' ? undefined : app.currentChatRoom}
      },
      success: function (data) {
        console.log('chatterbox: Message fetched', data);
        app.clearMessages();
        for (var i = data.results.length - 1; i >= 0; i--) {
          if (first) {
            app.addRoom(data.results[i].roomname);
          }
          if (data.results[i].roomname === app.currentChatRoom || app.currentChatRoom === 'lobby') {
            app.addMessage(data.results[i]);
          }
        }
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to fetch message', data);
      }
    });
  },

  clearMessages() {
    $('#chats').children().remove();
  },

  addMessage(message) {
    var $msg = $('<div/>').addClass('chat');
    var $user = $('<h3/>').addClass('username').text(message.roomname + '-' + message.username);
    var $text = $('<p/>').addClass('text').text(message.text);

    $msg.append($user).append($text);
    // var $msg = `<div class="chat"><h3 class="username">room:${message.roomname} - ${message.username}:</h3><p class="text">${message.text}</p></div>`;
    $('#chats').prepend($msg);
    if (this.users[message.username] === undefined) {
      this.users[message.username] = false;
    }
    $('#chats').children().first().click((event) => {
      if (this.users[message.username]) {
        this.removeFriend(message.username);
      } else {
        this.addFriend(message.username);
      }
    });
    if (app.users[message.username]) {
      $('#chats').children().first().addClass('friend');
    }
  },

  addRoom(roomName) {
    if (app.chatrooms[roomName] === undefined) {
      var $room = $('<option/>').val(roomName).text(roomName); //`<option>${roomName}</option>`;
      $('#roomSelect').prepend($room);
      app.chatrooms[roomName] = true;
    } else {
      //document.getElementById('roomSelect').value = roomName;
      app.currentChatRoom = roomName;
    }
    $('#roomSelect').val(roomName);
  },

  addFriend(username) {
    this.users[username] = true;
  },

  removeFriend(username) {
    this.users[username] = false;
  },

  handleSubmit() {
    console.log ('submitted');
    var message = {
      username: app.myUser,
      text: $('#message').val(),
      roomname: app.currentChatRoom
    };

    app.send(message);
    app.fetch();
  },

  escaper(string) {
    return (/<\/?\w+/).test(string);
  },

  changeTab() {
    if (app.tabbedrooms[app.currentChatRoom] === undefined) {
      console.log("abcd");
      app.tabbedrooms[app.currentChatRoom] = true;
      $tab = `<li><a class="tab">${app.currentChatRoom}</a></li>`;
      $('#tabList').children().last().prev().before($tab);
      $('.selected').removeClass('selected');
      $('#tabList').children().last().prev().prev().addClass('selected');
      //$('#tabList').children().last().prev().prev().before($tab);
    } else {
      $('.selected').removeClass('selected');
      $(this).addClass('selected');
    }
  }
};

$(document).ready(() => {
  $('#createNewRoom').hide();
  $('#selector').hide();
  app.fetch(true);
  setInterval(() => { app.fetch(); }, 3000);
  app.myUser = window.location.search.match(/username=(.+)/)[1];

  $('#send .submit').submit((event) => { 
    app.handleSubmit();
    event.preventDefault();
  });

  $('#roomSelect').change(function(event) {

    //create new room
    if ($(this).val() === 'create new room') {
      $('#createNewRoom').show();
      $('#createNewRoom').submit((event) => {
        var chatroom = $('.roomNameInput').val();
        app.addRoom(chatroom);
        app.currentChatRoom = chatroom;
        event.preventDefault();
        $('#createNewRoom').hide();
        app.changeTab();
      });

    //or switch current room to selection
    } else {
      app.currentChatRoom = $(this).val();
      app.changeTab();
    }

  });

  $('#tabList').on('click', '.tab', function(event) {
    app.currentChatRoom = $(this).text();
    $('.selected').removeClass('selected');
    $(this).addClass('selected');
  });

  $('#tabList').on('click', '#newTab', function(event) {
    $('#selector').slideToggle();
    //var $newTab = $('<li/>').append
  });

  $('#tabList').on('click', '#removeTab', function(event) {
    $('.selected').remove();
    $('.tab').first().addClass('selected');
    tabbedrooms[$(this).text()] = undefined;
    app.currentChatRoom = $('.tab').first().text() || false;
    //var $newTab = $('<li/>').append
  });

});

// var changeRoom = function(evt, room) {
//   app.currentChatRoom = room;
// };