'use strict';

angular.module('metadatamanagementApp').config(
  function($translateProvider) {
    var translations = {
      //jscs:disable
      'user-management': {
        'home': {
          'title': 'User Management',
          'createLabel': 'Create a new user',
          'createOrEditLabel': 'Create or edit a user'
        },
        'delete': {
          'question': 'Are you sure you want to delete user {{ login }}?'
        },
        'detail': {
          'title': 'User'
        },
        'first-name': 'First name',
        'last-name': 'Last name',
        'email': 'Email',
        'activated': 'Activated',
        'deactivated': 'Deactivated',
        'profiles': 'Profiles',
        'langKey': 'Language',
        'createdBy': 'Created by',
        'createdDate': 'Created date',
        'lastModifiedBy': 'Modified by',
        'lastModifiedDate': 'Modified date',
        'error': {
          'authority': {
            'name': {
              'not-null': 'The Name of Authority must not be empty!'
            }
          },
          'user': {
            'login': {
              'not-null': 'The Login must not be empty!'
            },
            'password': {
              'not-null': 'The Password must not be empty!'
            }
          }
        },
        'activate': {
          'title': 'Activation',
          'messages': {
            'success': '<strong>Your user has been activated.</strong> Please ',
            'error': '<strong>Your user could not be activated.</strong> Please use the registration form to sign up.'
          }
        },
        'login': {
          'login': 'Login',
          'title': 'Sign in',
          'form': {
            'password': 'Password',
            'password-placeholder': 'Your password',
            'rememberme': 'Remember me',
            'button': 'Sign in'
          },
          'messages': {
            'error': {
              'authentication': '<strong>Failed to sign in!</strong> Please check your credentials and try again.'
            }
          },
          'password': {
            'forgot': 'Did you forget your password?'
          },
          'registration': {
            'register': 'Register a new account'
          }
        },
        'password': {
          'title': 'Change Password for <b>{{username}}</b>',
          'form': {
            'button': 'Save'
          },
          'messages': {
            'error': '<strong>An error has occurred!</strong> The password could not be changed.',
            'success': '<strong>Password changed!</strong>'
          }
        },
        'register': {
          'title': 'Registration',
          'form': {
            'button': 'Register'
          },
          'messages': {
            'validate': {
              'login': {
                'required': 'Your username is required.',
                'minlength': 'Your username is required to be at least 1 character.',
                'maxlength': 'Your username cannot be longer than 50 characters.',
                'pattern': 'Your username can only contain lower-case letters and digits.'
              }
            },
            'success': '<strong>Registration saved!</strong> Please check your email for confirmation.',
            'error': {
              'fail': '<strong>Registration failed!</strong> Please try again later.',
              'userexists': '<strong>Login name already registered!</strong> Please choose another one.',
              'emailexists': '<strong>E-mail is already in use!</strong> Please choose another one.'
            }
          }
        },
        'reset': {
          'request': {
            'title': 'Reset your password',
            'form': {
              'button': 'Reset password'
            },
            'messages': {
              'info': 'Enter the e-mail address you used to register',
              'success': 'Check your e-mails for details on how to reset your password.',
              'notfound': '<strong>E-Mail address isn\'t registered!</strong> Please check and try again'
            }
          },
          'finish': {
            'title': 'Reset password',
            'form': {
              'button': 'Validate new password'
            },
            'messages': {
              'info': 'Choose a new password',
              'success': '<strong>Your password has been reset.</strong> Please ',
              'keymissing': 'The reset key is missing.',
              'error': 'Your password couldn\'t be reset. Remember a password request is only valid for 24 hours.'
            }
          }
        },
        'settings': {
          'title': 'Account Details for <b>{{username}}</b>',
          'form': {
            'firstname': 'First Name',
            'firstname.placeholder': 'Your first name',
            'lastname': 'Last Name',
            'lastname.placeholder': 'Your last name',
            'language': 'Language',
            'button': 'Save'
          },
          'messages': {
            'error': {
              'fail': '<strong>An error has occurred!</strong> Account Details could not be saved.',
              'emailexists': '<strong>E-mail is already in use!</strong> Please choose another one.'
            },
            'success': '<strong>Account Details saved!</strong>',
            'validate': {
              'firstname': {
                'required': 'Your first name is required.',
                'minlength': 'Your first name is required to be at least 1 character',
                'maxlength': 'Your first name cannot be longer than 50 characters'
              },
              'lastname': {
                'required': 'Your last name is required.',
                'minlength': 'Your last name is required to be at least 1 character',
                'maxlength': 'Your last name cannot be longer than 50 characters'
              }
            }
          }
        },
        'user-messages': {
          'create-title': 'Create Message to all Users (currently online)',
          'new-message-title': 'New Message from {{sender}}',
          'message-de-label': 'Notification (in German)',
          'message-en-label': 'Notification (in English)',
          'dialog-tooltip': {
            'close': 'Click to cancel sending a message',
            'send': 'Click to send the message to all users (currently online)',
            'open-create-dialog': 'Click to create a message to all users (currently online)'
          },
          'buttons': {
            'send': 'Send'
          }
        }
      }
      //jscs:enable
    };
    $translateProvider.translations('en', translations);
  });
