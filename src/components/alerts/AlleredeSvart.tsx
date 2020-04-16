import React from 'react';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';

interface Props {
    visible: boolean;
    className: string;
}

function AlleredeSvart(props: Props) {
    if (!props.visible) {
        return null;
    }

    return (
        <AlertStripeInfo className={props.className}>
            Du har allerede sendt et svar. Du kan gjerne svare igjen hvis du ønsker det.
        </AlertStripeInfo>
    );
}

export default AlleredeSvart;
