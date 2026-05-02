import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() label = 'Choisir un fichier';
  @Input() helperText = 'Formats autorisés';
  @Input() accept = '*/*';
  @Input() multiple = false;
  @Input() buttonColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() maxSizeMb = 10;
  @Input() preview = true;
  @Input() dropZoneLabel = 'Glissez-déposez votre fichier ici';
  @Input() emptyPreviewUrl = 'assets/images/profile/user-1.jpg';

  @Output() fileSelected = new EventEmitter<File | File[] | null>();

  selectedFile: File | null = null;
  selectedFiles: File[] = [];
  selectedFileName = '';
  selectedFileNames: string[] = [];
  previewUrl = '';
  previewUrls: string[] = [];
  errorMessage = '';
  isDragging = false;

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.handleFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    const files = event.dataTransfer ? Array.from(event.dataTransfer.files) : [];
    this.handleFiles(files);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFiles = [];
    this.selectedFileName = '';
    this.selectedFileNames = [];
    this.previewUrl = '';
    this.previewUrls = [];
    this.errorMessage = '';

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    this.fileSelected.emit(null);
  }

  private handleFiles(files: File[]): void {
    this.errorMessage = '';

    if (!files.length) {
      this.removeFile();
      return;
    }

    const validFiles = files.filter((file) => this.isValidSize(file));
    if (validFiles.length !== files.length) {
      this.errorMessage = `Un ou plusieurs fichiers dépassent ${this.maxSizeMb} MB.`;
      return;
    }

    if (!this.multiple && validFiles.length > 1) {
      this.errorMessage = 'Veuillez sélectionner un seul fichier.';
      return;
    }

    if (this.multiple) {
      this.selectedFiles = validFiles;
      this.selectedFileNames = validFiles.map((file) => file.name);
      this.selectedFile = null;
      this.selectedFileName = '';
      this.previewUrls = [];
      this.generatePreviews(validFiles);
      this.fileSelected.emit(validFiles);
    } else {
      const file = validFiles[0];
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.selectedFiles = [];
      this.selectedFileNames = [];

      if (this.preview && file.type.startsWith('image/')) {
        this.generatePreview(file);
      } else {
        this.previewUrl = '';
      }

      this.fileSelected.emit(file);
    }
  }

  private isValidSize(file: File): boolean {
    const sizeInMb = file.size / (1024 * 1024);
    return sizeInMb <= this.maxSizeMb;
  }

  private generatePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private generatePreviews(files: File[]): void {
    files.forEach((file) => {
      if (this.preview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrls.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    });
  }
}
