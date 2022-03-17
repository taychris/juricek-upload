import { Injectable, NgZone } from '@angular/core';
import firebase from "firebase/compat/app";
import "firebase/auth";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authState: any; // Save logged in user data
  currentUser!: any;
  user$!: Observable<firebase.User>;

  constructor( 
    public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,  
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    // @Inject(PLATFORM_ID) private platformId: Object
    ) {
      this.afAuth.onAuthStateChanged(user => {
        const userData = {
          displayName: user?.displayName,
          emailVerified: user?.emailVerified
        }
        this.SetUserDataInLocalStorage(userData);
      }) 
    }

  SendVerificationMail() {
    this.afAuth.currentUser.then(u => u?.sendEmailVerification()).then(() => {
      window.alert("Úspešne ste sa zaregistrovali. Poslali sme vám email, prosím potvrďte zadaný email.");
    }); 
  }

  SignUp(email: any, password: any, name: any) {
    return this.afAuth.createUserWithEmailAndPassword(email, password)
    .then((result : any) => {
      const user = result.user;

      if(user) {
        user.updateProfile({
          displayName: name
        });
        
        this.SendVerificationMail();
        this.SetUserData(user);
        this.SetUserDataInLocalStorage(user);
        this.SignIn(email, password);
      }

    }).catch((error : any) => {
      window.alert(error.message);
    });
  }

  SignIn(email: any, password: any) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then(() => {
        this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        });
      }).catch((error : any) => {
        window.alert(error.message)
      })
  }

  // Sign out 
  SignOut() {
    return this.afAuth.signOut().then(() => {
      this.SetUserDataInLocalStorage();
      this.router.navigate(['login']);
    })
  }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
    }
    return userRef.set(userData, {
      merge: true
    })
  }

  SetUserDataInLocalStorage(user?: any) {
    if(user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  get isLoggedIn() {
    return this.afAuth.user;
  }
}
