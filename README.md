# HRM-backendgit




In this schema, the Contractor model has fields first_name, last_name, email, password, phoneNumber, and profileID. The profileID field is of type ObjectId and references the Profile model. By using the ref option, you establish a relationship between the Contractor and Profile models.

Whenever a profile is created or updated for a contractor, you can save the corresponding profileID in the Contractor document to establish the association between the two.

Make sure you have a separate schema for the Profile model and that it is defined correctly before using it in the Contractor schema.