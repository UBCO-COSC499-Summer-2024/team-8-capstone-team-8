import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import the package
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AISettings.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';
import '../GeneralStyling.css';
import '../ToastStyles.css';

const AISettings = () => {
    const [answerType, setAnswerType] = useState('');
    const [detailLevel, setDetailLevel] = useState('');
    const [promptText, setPromptText] = useState('No Prompt Selected');
    const [instructorId, setInstructorId] = useState('');
    const [prompts, setPrompts] = useState([]);
    const [selectedPromptId, setSelectedPromptId] = useState('');
    const [isEditable, setIsEditable] = useState(false);

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                const response = await axios.get('http://localhost:5173/eval-api/instructor/me', {
                    withCredentials: true
                });
                setInstructorId(response.data.instructorId);
            } catch (error) {
                console.error('There was an error fetching the instructor data:', error);
            }
        };

        fetchInstructorData();
    }, []);

    useEffect(() => {
        const fetchPromptsData = async () => {
            if (instructorId) {
                try {
                    const response = await axios.get(`http://localhost:5173/eval-api/prompts/${instructorId}`, {
                        withCredentials: true
                    });
                    setPrompts(response.data);
                } catch (error) {
                    console.error('There was an error fetching the prompts data:', error);
                }
            }
        };
        fetchPromptsData();
    }, [instructorId]);

    useEffect(() => {
        const fetchPromptData = async () => {
            if (instructorId) { 
                try {
                    const response = await axios.get(`http://localhost:5173/eval-api/prompt/${instructorId}`, {
                        withCredentials: true
                    });
                    if (response.data.promptId) {
                        setSelectedPromptId(response.data.promptId.toString());
                        setPromptText(response.data.promptText || '');
                        setIsEditable(true);
                    } else {
                        setSelectedPromptId('clear');
                        setPromptText('No Prompt Selected');
                        setIsEditable(false);
                    }
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        setSelectedPromptId('clear');
                        setPromptText('No Prompt Selected');
                        setIsEditable(false);
                    } else {
                        console.error('There was an error fetching the prompt data:', error);
                    }
                }
            }
        };
        fetchPromptData();
    }, [instructorId]);

    const handleAnswerTypeChange = (event) => {
        setAnswerType(event.target.value);
    };

    const handleDetailLevelChange = (event) => {
        setDetailLevel(event.target.value);
    };

    const handlePromptTextChange = (event) => {
        setPromptText(event.target.value);
    };

    const handlePromptSelect = async (event) => {
        const selectedId = event.target.value;

        if (selectedId === 'clear') {
            try {
                await axios.put(`http://localhost:5173/eval-api/prompt/clear/${instructorId}`, {});
                setSelectedPromptId('clear');
                setPromptText('No Prompt Selected');
                setIsEditable(false);
            } catch (error) {
                console.error('There was an error clearing the selected prompt:', error);
            }
        } else {
            const selectedPrompt = prompts.find(prompt => prompt.promptId.toString() === selectedId);
            try {
                await axios.put(`http://localhost:5173/eval-api/prompt/select/${selectedId}`, {
                    instructorId: instructorId
                });
                setSelectedPromptId(selectedId);
                setPromptText(selectedPrompt ? (selectedPrompt.promptText || '') : '');
                setIsEditable(true);
            } catch (error) {
                console.error('There was an error updating the selected prompt:', error);
            }
        }
    };

    const handleEditPrompt = (promptId) => {
        const prompt = prompts.find(p => p.promptId === promptId);

        confirmAlert({
            customUI: ({ onClose }) => {
                const handleSave = async () => {
                    const newName = document.getElementById('prompt-name-input').value;
                    if (newName) {
                        await updatePromptName(promptId, newName);
                        toast.success('Prompt name updated successfully');
                    }
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Edit Prompt Name</h1>
                        <p>Enter new name for the prompt:</p>
                        <input
                            type="text"
                            id="prompt-name-input"
                            defaultValue={prompt.promptName}
                            className="prompt-name-input-s"
                        />
                        <div className="button-group">
                            <button onClick={onClose} className="cancel-button">Cancel</button>
                            <button onClick={handleSave} className="cancel-button">Save</button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "custom-overlay",
        });
    };

    const updatePromptName = async (promptId, newName) => {
        try {
            const response = await axios.put(`http://localhost:5173/eval-api/prompt/name/${promptId}`, {
                promptName: newName
            });
            setPrompts(prompts.map(prompt => 
                prompt.promptId === promptId ? { ...prompt, promptName: response.data.promptName } : prompt
            ));
            toast.success('Prompt name updated successfully');
        } catch (error) {
            console.error('There was an error updating the prompt name:', error);
            toast.error('Error updating prompt name');
        }
    };

    const handleDeletePrompt = async (promptId) => {
        const prompt = prompts.find(p => p.promptId === promptId);
        const confirmDelete = window.confirm(`Are you sure you want to delete the prompt: ${prompt.promptName}?`);
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:5173/eval-api/prompt/${promptId}`);
                setPrompts(prompts.filter(prompt => prompt.promptId !== promptId));
                if (promptId.toString() === selectedPromptId) {
                    setSelectedPromptId('clear');
                    setPromptText('No Prompt Selected');
                    setIsEditable(false);
                }
            } catch (error) {
                console.error('There was an error deleting the prompt:', error);
            }
        }
    };

    const handleCreatePrompt = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                const handleSave = async () => {
                    const newPromptName = document.getElementById('new-prompt-name-input').value;
                    if (newPromptName) {
                        await createNewPrompt(newPromptName);
                        toast.success('Prompt created successfully');
                    }
                    onClose();
                };

                return (
                    <div className="custom-ui">
                        <h1>Create New Prompt</h1>
                        <p>Enter name for the new prompt:</p>
                        <input
                            type="text"
                            id="new-prompt-name-input"
                            className="prompt-name-input-s"
                        />
                        <div className="button-group">
                            <button onClick={onClose} className="cancel-button">Cancel</button>
                            <button onClick={handleSave} className="cancel-button">Save</button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "custom-overlay",
        });
    };

    const createNewPrompt = async (promptName) => {
        try {
            const response = await axios.post('http://localhost:5173/eval-api/prompt', {
                promptName,
                promptText: '',
                instructorId
            });
            const newPrompt = response.data;
            setPrompts([...prompts, newPrompt]);
            setSelectedPromptId(newPrompt.promptId.toString());
            setPromptText('');
            setIsEditable(true);
            await handlePromptSelect({ target: { value: newPrompt.promptId.toString() } });
        } catch (error) {
            console.error('There was an error creating the new prompt:', error);
            toast.error('Error creating new prompt');
        }
    };

    const handleSavePromptText = async () => {
        if (selectedPromptId) {
            try {
                await axios.put(`http://localhost:5173/eval-api/prompt/text/${selectedPromptId}`, {
                    promptText
                });
                const updatedPrompts = prompts.map(prompt =>
                    prompt.promptId.toString() === selectedPromptId ? { ...prompt, promptText } : prompt
                );
                setPrompts(updatedPrompts);
                toast.success("Prompt has been saved successfully");
            } catch (error) {
                console.error('There was an error updating the prompt text:', error);
                toast.error('Error updating prompt text');
            }
        }
    };

    return (
        <div>
            <ToastContainer />
            <AIvaluateNavBarEval tab="ai" navBarText="AI Settings" />
            <div className='secondary-colorbg ai-section'>
                <div className="ai-settings-div">
                    <h1>Your AI Prompt Engineering</h1>
                    <div className="ai-settings-content">
                        <div className="textarea-button-group">
                            <textarea
                                value={promptText}
                                onChange={handlePromptTextChange}
                                placeholder="Enter your prompt here"
                                rows="4"
                                cols="50"
                                className="ai-settings-textarea"
                                readOnly={!isEditable}
                                title="This prompt should specifically explain to the AI how it should generally mark all of your assignments across all of your classes. Some example includes: 'Please mark all assignments based on the rubric provided and provide feedback on each criterion', 'Please provide feedback on each criterion with a detailed explanation', 'Please tell the students exactly how they lost each point', 'Be very strict on grading the use of Camel case notion. Students should always lose 2 point's for using a different variable naming notion'"
                            />
                            <div className="button-group">
                                <button type="button" className="create-prompt" onClick={handleCreatePrompt} title="Click to create a new mini prompt. These are the prompts located to the right of the text area.">
                                    <CircumIcon name="circle_plus" /> Create Prompt
                                </button>
                                <button type="submit" className="update-ai" onClick={handleSavePromptText}>
                                    <CircumIcon name="coffee_cup" /> Save Prompt
                                </button>
                            </div>
                        </div>
                        <div className="radio-group">
                            {prompts.map(prompt => (
                                <div key={prompt.promptId} className="radio-item third-color-text">
                                    <label className="third-color-text">
                                        <input
                                            type="radio"
                                            value={prompt.promptId}
                                            checked={selectedPromptId === prompt.promptId.toString()}
                                            onChange={handlePromptSelect}
                                        />
                                        {prompt.promptName}
                                    </label>
                                    <div className="icon-buttons">
                                        <button onClick={() => handleEditPrompt(prompt.promptId)}>
                                            <CircumIcon name="edit" />
                                        </button>
                                        <button className="trash-icon" onClick={() => handleDeletePrompt(prompt.promptId)}>
                                            <CircumIcon name="trash" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="radio-item">
                                <label>
                                    <input
                                        type="radio"
                                        value="clear"
                                        checked={selectedPromptId === 'clear'}
                                        onChange={handlePromptSelect}
                                    />
                                    Clear Prompt
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISettings;
