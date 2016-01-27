package com.epam.indigoeln.core.util;

import java.io.IOException;

import org.json.JSONObject;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class JSONObjectDeserializer  extends JsonDeserializer<JSONObject> {

    @Override
    public JSONObject deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
            throws IOException {
        return new JSONObject(jsonParser.getText());
    }
}
