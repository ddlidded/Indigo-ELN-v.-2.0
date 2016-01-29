package com.epam.indigoeln.web.rest.util;

import com.epam.indigoeln.core.model.Batch;
import com.epam.indigoeln.core.model.Experiment;
import com.epam.indigoeln.core.model.Template;
import com.epam.indigoeln.core.model.Notebook;
import com.epam.indigoeln.core.model.Project;
import com.epam.indigoeln.core.model.User;
import com.epam.indigoeln.web.rest.dto.BatchDTO;
import com.epam.indigoeln.web.rest.dto.ExperimentDTO;
import com.epam.indigoeln.web.rest.dto.TemplateDTO;
import com.epam.indigoeln.web.rest.dto.ManagedUserDTO;
import com.epam.indigoeln.web.rest.dto.NotebookDTO;
import com.epam.indigoeln.web.rest.dto.ProjectDTO;
import com.epam.indigoeln.web.rest.dto.UserDTO;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


/**
 * Custom MapStruct mapper for converting DTO/Model objects
 */
@Mapper
public interface CustomDtoMapper {

    String AUTHORITIES_CONVERTER_EXPR = "java(userDTO.getAuthorities().stream().map(com.epam.indigoeln.core.model.Authority::new).collect(java.util.stream.Collectors.toSet()))";

    @Mapping(target = "authorities", expression = AUTHORITIES_CONVERTER_EXPR)
    User convertFromDTO(UserDTO userDTO);

    @Mapping(target = "authorities", expression = AUTHORITIES_CONVERTER_EXPR)
    User convertFromDTO(ManagedUserDTO userDTO);

    Project convertFromDTO(ProjectDTO dto);

    ProjectDTO convertToDTO(Project project);

    Notebook convertFromDTO(NotebookDTO dto);

    NotebookDTO convertToDTO(Notebook notebook);

    Experiment convertFromDTO(ExperimentDTO dto);

    ExperimentDTO convertToDTO(Experiment experiment);

    Batch convertFromDTO(BatchDTO batchDTO);

    @Mapping(target = "templateContent", expression = "java(com.epam.indigoeln.core.util.JsonUtil.basicDBListFromJsonArray(templateDTO.getTemplateContent()))")
    Template convertFromDTO(TemplateDTO templateDTO);

}
