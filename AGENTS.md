
/profile/kyc- on this page from here user can submit their Kyc from here user select his country , choose his docment type , then write all nessesery informations 
from here remove the Expiry date option then upload his id card front side and back side photo (for photo user cloudinary to store images) then take a selfie and upload it and then click on submit verificationthen show the pending review and if the admin mark as verify then on this page here show KYC verified. if admin reject then show again submit (with a reason) and then user can submit again. and make sure all data are store in database and also the cloudinary for store the images

and now the admin section on the /admin/kyc page remove all mock data from this page and add database and backend and when admin or owner click on the kyc request list view button then he can see the full details like user basic information (here on the username place show the userid ) and every details and here if admin or owner reject the application then must be write a reason then user have to re apply for kyc or approve then user is verified. all the data show from database


and also a user can only access the users and public pages otherwise if search any admin or owner pages then he automatic redirect to 404 page , and a admin can only access the user public and the admin pages otherwise if he search on any owner pages then he auto redirect to 404 page but a owner can access all pages on this site 

and also check the supabase/auth.sql also update this sql for this kyc 
