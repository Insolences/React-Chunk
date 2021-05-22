import './App.css';
import {useEffect, useState} from "react";
import {Form, Jumbotron, ProgressBar} from "react-bootstrap";
import axios from "axios";


const flowChunkSize = 1048576;

function App() {

    const [showProgress, setShowProgress] = useState(false);
    const [counter, setCounter] = useState(1);
    const [fileToBeUpload, setFileToBeUpload] = useState({});
    const [beginingOfTheChunk, setBeginingOfTheChunk] = useState(0);
    const [endOfTheChunk, setEndOfTheChunk] = useState(flowChunkSize);
    const [progress, setProgress] = useState(0);
    const [fileGuid, setFileGuid] = useState("");
    const [fileSize, setFileSize] = useState(0);
    const [chunkCount, setChunkCount] = useState(0);
    const [flowCurrentChunkSize, setFlowCurrentChunkSize] = useState(0);

    const progressInstance = (
        <ProgressBar animated now={progress} label={`${progress}%`} />
    );

    useEffect(() => {
        if (fileSize > 0) {
            setShowProgress(true);
            fileUpload (counter);
        }
    }, [fileToBeUpload, progress]);


    const getFileContext = (e) => {
        const _file = e.target.files[0];
        console.log(_file)
        setFileSize(_file.size);
        const _totalCount =
            _file.size % flowChunkSize === 0
                ? _file.size / flowChunkSize
                : Math.floor(_file.size / flowChunkSize) + 1; // Total count of chunks will have been upload to finish the file
        setChunkCount(_totalCount);
        setFileToBeUpload(_file);
        const _fileName = _file.name;
        setFileGuid(_fileName);
    };

    console.log('fileGuid:', fileGuid)
    console.log('chunkCount:', chunkCount)
    console.log('beginingOfTheChunk:', beginingOfTheChunk)
    console.log('endOfTheChunk:', endOfTheChunk)
    console.log('fileToBeUpload:', fileToBeUpload)

    const fileUpload  = () => {
        setCounter(counter + 1);
        if (counter <= chunkCount) {
            const chunk = fileToBeUpload.slice(beginingOfTheChunk, endOfTheChunk);
            console.log('chunk: ', chunk)
            uploadChunk(chunk);
        }
    };

    const uploadChunk = async (chunk) => {
        console.log('send chunk: ', chunk)
        setBeginingOfTheChunk(endOfTheChunk);
                setEndOfTheChunk(endOfTheChunk + flowChunkSize);
                if (counter === chunkCount) {
                    console.log("Process is complete, counter", counter);
                    await uploadCompleted();
                } else {
                    const percentage = (counter / chunkCount) * 100;
                    setProgress(percentage);
                }
        // try {
        //     const response = await axios.post(
        //         " http://localhost:8181/hopsworks-api/api/project/{projectId}/datasets/upload/{path}",
        //         chunk,
        //         {
        //             headers: {"Content-Type": "multipart_form_data"}
        //         })
        //     const data = response.data;
        //     if (data.isSuccess) {
        //         setBeginingOfTheChunk(endOfTheChunk);
        //         setEndOfTheChunk(endOfTheChunk + flowChunkSize);
        //         if (counter === chunkCount) {
        //             console.log("Process is complete, counter", counter);
        //             await uploadCompleted();
        //         } else {
        //             const percentage = (counter / chunkCount) * 100;
        //             setProgress(percentage);
        //         }
        //     } else {
        //         console.log("Error Occurred:");
        //     }
        // } catch (error) {
        //     console.log("error", error);
        // }
    };

    const uploadCompleted = async () => {
        const formData = new FormData();
        formData.append("fileName", fileGuid);
        const response = await axios.post(
            "https://localhost:44356/weatherforecast/UploadComplete",
            {},
            {
                params: {
                    fileName: fileGuid,
                },
                data: formData,
            }
        );

        const data = response.data;
        if (data.isSuccess) {
            setProgress(100);
        }
    };

    return (
        <Jumbotron>
            <Form>
                <Form.Group>
                    <Form.File
                        id="exampleFormControlFile1"
                        onChange={getFileContext}
                        label="Example file input"
                    />
                </Form.Group>
                <Form.Group style={{ display: showProgress ? "block" : "none" }}>
                    {progressInstance}
                </Form.Group>
            </Form>
        </Jumbotron>
    );
}

export default App;
