
ok good . now please fix the authincation workflow . 

i tell you again all of this things any user visitors can visit the / page or home page . 
when anyone try to create account and then if he faild to create account back to back 5 time then he cannot try to create account again under 12 hour . 
and when any user try to login and for any reason (wrong password , wrong email or wrong id)he failed to signin back to back 5 time then he just also cannot login or signin for next 12 hour . 
and if any one successfully signin to the site and then if here user then redirect him to /dashboard page and he can only access the user side pages .and if any by chance user try to access the admin or owner pages then he redirect to the 404 page 
and if the signin user is admin then he redirect to the /admin/dashboard can only access the user side and admin side pages .and any by chance admi try to go owner side page then he auto redirect to 404 page 
and if the user is owner then he redirect to the /owner and he can access to all pages .   

and the signin system is for 5 hour like (if any one sign in on his account then create a token which is expire after 5 hours) after 5 hour he have to sign in again . and if the user/admin/owner logout from his account then the token is expired fully , and when he go to the dashbaord then he have to sign in again . 

if any any one try to access the user side any page without login then send him to /signin page . and try to admin or owner page then send him to 404 page . 
