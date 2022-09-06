document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(null));
  document.querySelector('#compose-submit-btn').addEventListener('click', compose_submit);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  console.log(email);
  // Clear out composition fields
  if (email === null) {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
  else {
    document.querySelector('#compose-recipients').value = email.sender;
    if (email.subject.slice(0,3) != "Re:") {
      document.querySelector('#compose-subject').value = "Re:" + email.subject;
      // console.log("done")
    }
    else {
      document.querySelector('#compose-subject').value = email.subject;
    }
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n\n`;
  }
}

function load_mailbox(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(element => {
      const email_block = document.createElement('div');
      email_block.classList.add('email-div-view');
      email_block.innerHTML = `
      <div>Subject: ${element.subject}</div>
      <div>Sender: ${element.sender}</div>
      <div>Date: ${element.timestamp}</div>
      `
      if (element.read) {
        email_block.style.backgroundColor = "lightgray";
      }
      email_block.addEventListener('click', () => show_email(element.id, mailbox));
      document.querySelector('#emails-view').append(email_block);
    });
});




  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


function show_email(email_id, method) {
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    document.querySelector('#email-view').innerHTML = `
      <div>Subject: ${email.subject}</div>
      <div>From: ${email.sender}</div>
      <div>To: ${email.recipients}</div>
      <div>${email.body}</div>
      <div>Date: ${email.timestamp}</div>
      <div id="email-btns">
        <button id="reply" class="btn btn-primary">Reply</button>
        <button id="archive" class="btn btn-danger">${email.archived ? "Unacrchive" : "Archive"}</button>
      </div>
      `
    if (!email.read) {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }
    if (method === "sent") {
      document.querySelector("#email-btns").style.display = 'none';
    }

    document.querySelector('#archive').addEventListener('click', () => {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
      })
      // .then(response => response.json())
        .then(email => {
            // console.log(email);
            load_mailbox('inbox');
        });
    })

    document.querySelector('#reply').addEventListener('click', () => compose_email(email))
  });


  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
}

function compose_submit() {
  const compose_recipients = document.querySelector('#compose-recipients').value;
  const compose_subject = document.querySelector('#compose-subject').value;
  const compose_body = document.querySelector('#compose-body').value;
  // console.log(compose_recipients, compose_subject, compose_body);

  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: compose_recipients,
          subject: compose_subject,
          body: compose_body
      })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
    load_mailbox('sent');
  });
}