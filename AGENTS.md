signup and signin and the forgot-password page here add backend and database (supabase)- 

on the signup page here user input the First name and Last name , email , phone number(with + country code), then select the country and date of birth , and then the referral code (it is optional) this store in then enter the password and confirm password then store all things and send a 6 digit confirmation code on the user email and then the code user have to input on his code page if its correct then auto generate a 6 digit user id send him to /dashboard page . and make sure every single details are store in database make sure from same ip and same device a user can try to sign up 5 time in every 12 hour.

/signin page on this page 

here user can login with with his email and password and also can the 6 digit userid and password if correct then send him to /dashboard page and make sure from same ip and same device a user can try to sign in 5 time in every 12 hour. 

/forgot-password on this page if user enter the his email and if it is available in database then send a 6 digit password reset code and then if he enter the right code then just enter the new password and update the password in database also and then send him again /signin page to login and make sure from same ip and same device a user can try to forgot password 5 time in every 12 hour.

dont change and ui design single bit just add backend and supabase database and store the all sql file in Supabase folder