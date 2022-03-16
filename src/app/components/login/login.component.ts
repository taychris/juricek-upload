import { Component, OnInit } from '@angular/core';

import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { AuthService } from 'src/app/shared/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  signUpForm: FormGroup;
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.signUpForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      name: ['', Validators.required],
    });

    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  signUp(email: string, name: string, password: string) {
    return this.authService.SignUp(email, password, name).then((result : any) => {
      console.log(result);
    });
  }

  signIn(email: string, password: string) {
    return this.authService.SignIn(email, password).then(() => {
      console.log('logged in.');
    })
  }

}
