import { SelectedFileType } from "@/_types/iSelectedFileType";
import useAuthStore from "@/stores/authStore";

class UserService {

    private readonly userStore = useAuthStore.getState();
    
    async getProfilePhoto() {
        return await this.userStore.getProfilePhoto();
    }
    
    async handleChangePhoto(selectedFile: SelectedFileType | null) {
        if(selectedFile === null)
            throw new Error("Arquivo selecionado não pode ser nulo");

        await this.userStore.handleChangePhoto(selectedFile);
    }
}

export default UserService;