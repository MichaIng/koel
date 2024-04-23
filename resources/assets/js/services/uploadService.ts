import { without } from 'lodash'
import { reactive } from 'vue'
import { http } from '@/services'
import { albumStore, commonStore, overviewStore, songStore } from '@/stores'
import { logger } from '@/utils'
import axios from 'axios'

interface UploadResult {
  song: Song
  album: Album
}

export type UploadStatus =
  | 'Ready'
  | 'Uploading'
  | 'Uploaded'
  | 'Canceled'
  | 'Errored'

export interface UploadFile {
  id: string
  file: File
  status: UploadStatus
  name: string
  progress: number
  message?: string
}

export const uploadService = {
  state: reactive({
    files: [] as UploadFile[]
  }),

  simultaneousUploads: 5,

  queue (file: UploadFile | UploadFile[]) {
    this.state.files = this.state.files.concat(file)
    this.proceed()
  },

  remove (file: UploadFile) {
    this.state.files = without(this.state.files, file)
    this.proceed()
  },

  proceed () {
    const remainingSlots = this.simultaneousUploads - this.getUploadingFiles().length

    if (remainingSlots <= 0) {
      return
    }

    for (let i = 0; i < remainingSlots; ++i) {
      const file = this.getUploadCandidate()
      file && this.upload(file)
    }
  },

  getUploadingFiles () {
    return this.state.files.filter(({ status }) => status === 'Uploading')
  },

  getUploadCandidate () {
    return this.state.files.find(({ status }) => status === 'Ready')
  },

  shouldWarnUponWindowUnload () {
    return this.state.files.length > 0
  },

  async upload (file: UploadFile) {
    if (file.status === 'Uploading') {
      return
    }

    const formData = new FormData()
    formData.append('file', file.file)
    file.progress = 0
    file.status = 'Uploading'

    try {
      const result = await http.post<UploadResult>('upload', formData, (progressEvent: ProgressEvent) => {
        file.progress = progressEvent.loaded * 100 / progressEvent.total
      })

      file.status = 'Uploaded'

      songStore.syncWithVault(result.song)
      albumStore.syncWithVault(result.album)
      commonStore.state.song_length += 1
      overviewStore.refresh()

      this.proceed() // upload the next file

      window.setTimeout(() => this.remove(file), 1000)
    } catch (error: unknown) {
      logger.error(error)
      file.status = 'Errored'

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        file.message = `Upload failed: ${error.response.data.message}`
      } else {
        file.message = 'Upload failed: Unknown error.'
      }

      this.proceed() // upload the next file
    }
  },

  retry (file: UploadFile) {
    // simply reset the status and wait for the next process
    this.resetFile(file)
    this.proceed()
  },

  retryAll () {
    this.state.files.forEach(this.resetFile)
    this.proceed()
  },

  resetFile: (file: UploadFile) => {
    file.status = 'Ready'
    file.progress = 0
  },

  removeFailed () {
    this.state.files = this.state.files.filter(({ status }) => status !== 'Errored')
  }
}
