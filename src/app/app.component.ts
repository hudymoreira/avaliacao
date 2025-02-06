import { Component, OnInit,ViewChild } from '@angular/core';
import { Service } from '../services/service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

export interface Usuario {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    picture?: string;
  }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('fecharButton') fecharButton: any;
  @ViewChild('fecharNovoButton') fecharNovoButton: any;
  title = 'avaliacao';
  usuarios: Usuario[] = []; 
  usuarioSelecionado: Usuario | null = null;
  totalUsuarios: number = 0;
  paginaCorrente: number = 0;
  limit: number = 20;
  usuarioForm: FormGroup;
  usuarioNovoForm: FormGroup;
  errorMessage: string = '';
  flagErrorAoDeletar:boolean = false;
  constructor(private service : Service,private fb: FormBuilder){
    this.usuarioForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      title: ['', Validators.required],
      picture: [''],
    });
    this.usuarioNovoForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      title: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      phone: ['', Validators.required], 
      picture: ['', Validators.pattern('https?://.*')],
      location: this.fb.group({
        city: ['', Validators.required],
        country: ['', Validators.required],
      }),
    });
  }
  carregarUsuarios(page: number = this.paginaCorrente): void {
    this.service.getUsers(page, this.limit).subscribe((response) => {
      this.usuarios = response.data;
      this.totalUsuarios = response.total;
      console.log(this.usuarios);
    });
  }
  
  proximaPagina(): void {
    if ((this.paginaCorrente + 1) * this.limit < this.totalUsuarios) {
      this.paginaCorrente++;
      this.carregarUsuarios();
    }
  }
  
  paginaAnterior(): void {
    if (this.paginaCorrente > 0) {
      this.paginaCorrente--;
      this.carregarUsuarios();
    }
  }
  
  ngOnInit(): void {
    this.carregarUsuarios();
  }
  
  
  pegarTotalDePaginas(): number { 
    return Math.ceil(this.totalUsuarios / this.limit);
  }

  abrirModal(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
  }
  preencherFormulario(usuario: Usuario) {
    this.flagErrorAoDeletar = false;
    this.usuarioSelecionado = usuario;
    this.usuarioForm.reset();
    this.usuarioForm.patchValue({
      firstName: usuario.firstName,
      lastName:  usuario.lastName,
      title:     usuario.title,
      picture:   usuario.picture,
    });
  }
  salvar() {
    if (this.usuarioForm.valid) {
      if (this.usuarioSelecionado) {
        const postData = { ...this.usuarioForm.value };  
       
        this.service.updateUser(this.usuarioSelecionado.id, postData)
          .subscribe(
            (res) => {
              this.carregarUsuarios();
              this.fecharButton.nativeElement.click();
            },
            (error) => console.log(error)
          );
      }
    } else {
      console.log('Formulário inválido');
    }
  }
  salvarNovo(){
    if (this.usuarioNovoForm.valid) {
      const postData = { ...this.usuarioNovoForm.value };  
      delete postData.registerDate;
      delete postData.dateOfBirth;
        this.service.createUser( postData)
          .subscribe(
            (res) => {
              this.carregarUsuarios();
              this.fecharNovoButton.nativeElement.click();
            },
            (error) => {
              console.log(error);
            this.processarErro(error);
            }
          );
    } else {
      console.log('Formulário inválido');
    }
  }

  processarErro(error: any) {
    if (error.error && error.error.data) {
      this.errorMessage = this.formatarErros(error.error.data);      } else {
      this.errorMessage = 'Erro desconhecido. Tente novamente mais tarde.';
    }
  }

  formatarErros(data: any): string {
    let message = '';
    if (data.email) {
      message += `Email: ${data.email}\n`;
    }
    return message.trim().replace(/\n/g, '<br>');  
  }
  apagar(){
    if(this.usuarioSelecionado?.id){
      this.service.deleteUser(this.usuarioSelecionado.id)
    .subscribe(
      (res) => {
        this.carregarUsuarios(); 
        this.fecharButton.nativeElement.click();
        this.flagErrorAoDeletar = false; 
      },
      (error) => {
        this.flagErrorAoDeletar = true;
        console.error('Erro ao deletar usuário:', error);
      }
    );
    }
    
  }
}
