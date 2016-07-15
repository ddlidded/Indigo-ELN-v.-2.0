package com.epam.indigoeln.core.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.Objects;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Document(collection=Project.COLLECTION_NAME)
public class Project extends BasicModelObject {

    public static final String COLLECTION_NAME = "project";
    private static final long serialVersionUID = 4070038027286241064L;

    private List<String> tags;
    private String keywords;
    private String references;
    private String description;

    @JsonIgnore
    @DBRef(lazy = true)
    private List<Notebook> notebooks = new ArrayList<>();


    @JsonIgnore
    private Set<String> fileIds = new HashSet<>();

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public String getReferences() {
        return references;
    }

    public void setReferences(String references) {
        this.references = references;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Notebook> getNotebooks() {
        return notebooks;
    }

    public void setNotebooks(List<Notebook> notebooks) {
        this.notebooks = notebooks;
    }

    public Set<String> getFileIds() {
        return fileIds;
    }

    public void setFileIds(Set<String> fileIds) {
        this.fileIds = fileIds;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Project)) {
            return false;
        }
        if (!super.equals(o)) {
            return false;
        }
        Project project = (Project) o;
        return  Objects.equal(description, project.description);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(super.hashCode(), description);
    }

    @Override
    public String toString() {
        return "Project{} " + super.toString();
    }
}