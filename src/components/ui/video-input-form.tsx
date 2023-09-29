import { Label } from "@radix-ui/react-label";
import { Separator } from "./separator";
import { FileVideo, Upload } from "lucide-react";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export function VideoInputForm() {
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const promptInputRef = useRef<HTMLTextAreaElement>(null)

    function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
        const { files } = event.currentTarget

        if (!files) {
            return
        }

        const selectedFile = files[0]
        setVideoFile(selectedFile)


    }

    async function convertVideoToAudio(video: File) {
        console.log("Convert started.")

        const ffmpeg = await getFFmpeg()

        await ffmpeg.writeFile('input.mp4', await fetchFile(video))

        //ffmpeg.on('log', log => {
        //  console.log(log)
        //})

        ffmpeg.on('progress', progress => {
            console.log("Convert progress: ", + Math.round(progress.progress * 100))
        })

        await ffmpeg.exec([
            '-i',
            'input-mp4',
            '-map',
            '0:a',
            '-b:a',
            '20k',
            '-acodec',
            'libmp3lame',
            'output.mp3'


        ])
    }

    function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const prompt = promptInputRef.current?.value

        if (!videoFile) {
            return
        }

        // converter video em audio

    }

    const previewURL = useMemo(() => {
        if (!videoFile) {
            return null
        }

        return URL.createObjectURL(videoFile)
    }, [videoFile])

    return (
        <form onSubmit={handleUploadVideo} className="space-y-6">
            <label
                htmlFor="video"
                className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 justify-center items-center text-muted-foreground hover:bg-primary/5"
            >
                {previewURL ? (
                    <video src={previewURL} controls={false} className="pointer-events-none absolute inset-0" />
                ) : (
                    <>
                        <FileVideo className="w-4 h-4" />
                        Selecione um vídeo
                    </>
                )}
            </label>

            <input type="file" id="video" accept="video/mp4" className="sr-only" onChange={handleFileSelected} />

            <Separator />

            <div className="space-y-3">
                <Label htmlFor="transcription-prompt">Prompt de transcrição</Label>
                <Textarea
                    ref={promptInputRef}
                    id="transcription-prompt"
                    className="min-h-20 leading-relaxed"
                    placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)"
                />
                <Button type="submit" className="w-full">
                    Carregar video
                    <Upload className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </form>
    )
}