import React, {useEffect, useState} from 'react';
import {
    IonBackButton,
    IonButtons,
    IonHeader,
    IonPage,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonFab,
    IonFabButton,
    IonIcon,
    IonToast
} from '@ionic/react';
import {RouteComponentProps} from 'react-router';
import {share, bookmark} from 'ionicons/icons';
import './Details.css';

import {Plugins} from '@capacitor/core';

const {Share, Storage} = Plugins;

interface DogDetailPageProps extends RouteComponentProps<{
    breed: string;
    image: string;
}> {
}

const Details: React.FC<DogDetailPageProps> = ({match}) => {

    const [bookmarked, setBookmarked] = useState<boolean>(false);
    const [showToastBookmarked, setShowToastBookmarked] = useState<boolean>(false);

    async function initBookmarkDog() {
        const key: string | undefined = getImgKey();

        if (!key || key === undefined) {
            return;
        }

        try {
            const storedValue = await Storage.get({key: key});

            setBookmarked(storedValue && storedValue.value !== null);
        } catch (err) {
            // Whatever
        }
    }

    useEffect( () => {
        initBookmarkDog();
    }, []);

    async function shareDog() {
        try {
            await Share.share({
                title: 'Wooof',
                text: 'Checkout the cool doggo I found with Wooof',
                url: getImgUrl(),
                dialogTitle: 'Woof Wooof'
            });
        } catch (err) {
            // Whatever
        }
    }

    async function bookmarkDog() {
        const key: string | undefined = getImgKey();

        if (!key || key === undefined) {
            return;
        }

        try {
            await Storage.set({
                key: key,
                value: JSON.stringify({
                    breed: match.params.breed,
                    image: match.params.image
                })
            });

            setShowToastBookmarked(true);
            setBookmarked(true);
        } catch (err) {
            // Whatever
        }
    }

    async function removeBookmarkDog() {
        const key: string | undefined = getImgKey();

        if (!key || key === undefined) {
            return;
        }

        try {
            await Storage.remove({key: key});

            setShowToastBookmarked(true);
            setBookmarked(false);
        } catch (err) {
            // Whatever
        }
    }

    function getImgKey(): string | undefined | undefined {
        if (!match || !match.params || !match.params.breed || !match.params.image) {
            return undefined;
        }

        return `${match.params.breed}-${match.params.image}`;
    }

    function getImgUrl(): string | undefined {
        if (!match || !match.params || !match.params.breed || !match.params.image) {
            return undefined;
        }

        return `https://images.dog.ceo/breeds/${match.params.breed}/${match.params.image}`;
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="secondary">
                    <IonButtons slot="start">
                        <IonBackButton/>
                    </IonButtons>
                    <IonTitle>Detail</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <main>
                    {renderDog()}

                    <IonFab className="details-actions">
                        <IonFabButton color="secondary" onClick={() => shareDog()} aria-label="Share"
                                      className="ion-margin">
                            <IonIcon icon={share}/>
                        </IonFabButton>

                        <IonFabButton color={bookmarked ? 'primary' : 'tertiary'} onClick={() => bookmarked ? removeBookmarkDog() : bookmarkDog()} aria-label="Bookmark"
                                      className="ion-margin">
                            <IonIcon icon={bookmark}/>
                        </IonFabButton>
                    </IonFab>
                </main>

                <IonToast
                    isOpen={showToastBookmarked}
                    onDidDismiss={() => setShowToastBookmarked(false)}
                    message={bookmarked ? 'Doggo bookmark removed.' : 'Doggo bookmarked.'}
                    duration={1000}
                    position="top"
                />
            </IonContent>
        </IonPage>
    );

    function renderDog() {
        if (!match || !match.params || !match.params.breed || !match.params.image) {
            return undefined;
        }

        return <IonCard>
            <div>
                <img src={getImgUrl()} alt={`Dog ${match.params.image}`}/>
            </div>
        </IonCard>
    }
};

export default Details;
