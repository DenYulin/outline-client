package org.outline.xray;

import java.util.logging.Logger;

public class XRay {
    private static final Logger LOG = Logger.getLogger(XRay.class.getName());


    public synchronized boolean start(XRayConfig xRayConfig) {
        LOG.info("starting xray");
        return true
    }

    private void stopXrayProcess() {

    }

}


